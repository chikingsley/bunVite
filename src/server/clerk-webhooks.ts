import { Webhook } from 'svix';
import { createHumeConfig, deleteHumeConfig } from '@/utils/hume-auth';
import { createClerkClient } from '@clerk/backend';
import { BASE_PROMPT } from '@/utils/prompts/base-prompt';
import { createUser, deleteUser } from '@/utils/store-config';
import { initializePersistence } from '@/utils/store-config';

const clerkClient = createClerkClient({ 
  secretKey: process.env.CLERK_SECRET_KEY 
});

interface WebhookEvent {
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
    public_metadata?: {
      humeConfigId?: string;
    };
  };
  type: string;
}

// Initialize store
let storeInitialized = false;
async function ensureStoreInitialized() {
  if (!storeInitialized) {
    await initializePersistence();
    storeInitialized = true;
  }
}

export async function handleWebhook(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error('Missing SIGNING_SECRET');
  }

  // Initialize store if needed
  await ensureStoreInitialized();

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing Svix headers', { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Verification error:', err);
    return new Response('Verification error', { status: 400 });
  }

  // Handle webhook events
  const { id } = evt.data;
  const eventType = evt.type;
  console.log(`Received webhook: ${eventType} for user ${id}`);

  if (eventType === 'user.created') {
    console.log('Processing user.created webhook:', evt.data.id)
    try {
      // Get user details
      const email = evt.data.email_addresses[0]?.email_address;
      if (!email) throw new Error('No email address');

      const userId = evt.data.id
      const firstName = evt.data.first_name;
      const lastName = evt.data.last_name;

      console.log('Creating Hume config for user:', { userId, email });
      // Create Hume config
      const humeConfig = await createHumeConfig(email);
      console.log('Created Hume config:', { 
        id: humeConfig.id, 
        name: humeConfig.name,
        version: humeConfig.version 
      });

      console.log('Creating user in TinyBase:', { userId, email });
      // Create user in TinyBase
      createUser({
        id: userId,
        email: email,
        firstName: firstName,
        lastName: lastName,
        configId: humeConfig.id,
        systemPrompt: BASE_PROMPT
      });
      console.log('Created user in TinyBase:', userId);

      // Add a delay before updating Clerk metadata
      console.log('Waiting before updating Clerk metadata...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Updating Clerk metadata for user:', userId);
      // Update Clerk metadata
      await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          humeConfigId: humeConfig.id,
        }
      });
      console.log('Updated Clerk metadata with config ID:', humeConfig.id);
      
      return new Response('User created', { status: 200 });
    } catch (error) {
      console.error('Error in user.created:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      return new Response('Failed to create user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    console.log('Processing user.deleted webhook:', evt.data.id)
    try {
      const userId = evt.data.id
      if (!userId) {
        throw new Error('No user ID provided in webhook data')
      }

      // Delete from local store
      deleteUser(userId);
      console.log('Deleted user from store:', userId);

      // Get Hume config ID from metadata
      const humeConfigId = evt.data.public_metadata?.humeConfigId;
      if (!humeConfigId) {
        throw new Error('No Hume config ID found in metadata')
      }
      await deleteHumeConfig(humeConfigId);
      console.log('Deleted Hume config:', humeConfigId);

      return new Response('User deleted', { status: 200 });
    } catch (error) {
      console.error('Error in user.deleted:', error);
      return new Response('Failed to delete user', { status: 500 });
    }
  }

  return new Response('Webhook processed', { status: 200 });
} 