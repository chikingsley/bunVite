import { HumeConfig, HumeError } from './hume-types'

function getHumeApiKey() {
  const apiKey = import.meta.env.VITE_HUME_API_KEY
  if (!apiKey) {
    throw new Error('HUME_API_KEY is not defined in environment variables')
  }
  return apiKey
}

class HumeApiError extends Error implements HumeError {
  status?: number
  code?: string

  constructor(message: string, status?: number, code?: string) {
    super(message)
    this.name = 'HumeApiError'
    this.status = status
    this.code = code
  }
}

async function fetchHume<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `https://api.hume.ai/v0/evi${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Hume-Api-Key': getHumeApiKey(),  
      ...options.headers,
    },
  })

  // For DELETE requests or other requests that might return empty body
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  try {
    const data = await response.json()
    console.log('Hume API response:', {
      status: response.status,
      data
    })

    if (!response.ok) {
      throw new HumeApiError(
        data.message || `Hume API request failed: ${data.error || JSON.stringify(data)}`,
        response.status,
        data.code
      )
    }

    return data as T
  } catch (error) {
    console.error('Hume API error:', {
      status: response.status,
      error: error instanceof Error ? error.message : error
    })
    if (!response.ok) {
      throw new HumeApiError(
        error instanceof Error ? error.message : `Hume API request failed (${response.status})`,
        response.status
      )
    }
    throw error;
  }
}

export function createConfigPayload(email: string) {
  return {
    evi_version: "2",
    name: `mindpattern_${email.toLowerCase()}`,
    version_description: `MindPattern config for ${email} - Created ${new Date().toLocaleDateString()}`,
    voice: { provider: "HUME_AI", name: "KORA" },
    language_model: {
      model_provider: "CUSTOM_LANGUAGE_MODEL",
      model_resource: "https://tolerant-bengal-hideously.ngrok-free.app/api/chat/completions",
    },
    event_messages: {
      on_new_chat: { enabled: false, text: null },
      on_resume_chat: { enabled: false, text: null },
      on_disconnect_resume_chat: { enabled: false, text: null },
      on_inactivity_timeout: { enabled: false, text: null },
      on_max_duration_timeout: { enabled: false, text: null }
    },
    timeouts: {
      inactivity: { enabled: false, duration_secs: 60 },
      max_duration: { enabled: true, duration_secs: 1800 }
    }
  }
}

export async function createHumeConfig(email: string):
  Promise<HumeConfig> {
  console.log('Creating new Hume config for:', { email })
  
  const payload = createConfigPayload(email)
  console.log('Config payload:', JSON.stringify(payload, null, 2))

  const newConfig = await fetchHume<HumeConfig>('/configs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  // Validate the ID is a UUID
  if (!isValidUUID(newConfig.id)) {
    throw new HumeApiError(
      `Invalid UUID format returned from Hume API: ${newConfig.id}`,
      400,
      'INVALID_UUID'
    )
  }

  console.log('Created new config:', {
    id: newConfig.id,
    name: newConfig.name,
    version: newConfig.version
  })

  return newConfig
}

export async function deleteHumeConfig(configId: string): Promise<void> {
  console.log('Deleting Hume config:', configId)
  
  // Validate UUID format
  if (!isValidUUID(configId)) {
    throw new HumeApiError(
      `Invalid UUID format: ${configId}`,
      400,
      'INVALID_UUID'
    )
  }
  
  await fetchHume(`/configs/${configId}`, {
    method: 'DELETE',
  })

  console.log('Successfully deleted Hume config:', configId)
}

// UUID validation helper
export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}
