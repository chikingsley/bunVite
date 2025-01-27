Chat
Handshake
GET
wss://api.hume.ai/v0/evi/chat

Query parameters
config_id
string
Optional
The unique identifier for an EVI configuration.

Include this ID in your connection request to equip EVI with the Prompt, Language Model, Voice, and Tools associated with the specified configuration. If omitted, EVI will apply default configuration settings.

For help obtaining this ID, see our Configuration Guide.

config_version
integer
Optional
The version number of the EVI configuration specified by the config_id.

Configs, as well as Prompts and Tools, are versioned. This versioning system supports iterative development, allowing you to progressively refine configurations and revert to previous versions if needed.

Include this parameter to apply a specific version of an EVI configuration. If omitted, the latest version will be applied.

resumed_chat_group_id
string
Optional
The unique identifier for a Chat Group. Use this field to preserve context from a previous Chat session.

A Chat represents a single session from opening to closing a WebSocket connection. In contrast, a Chat Group is a series of resumed Chats that collectively represent a single conversation spanning multiple sessions. Each Chat includes a Chat Group ID, which is used to preserve the context of previous Chat sessions when starting a new one.

Including the Chat Group ID in the resumed_chat_group_id query parameter is useful for seamlessly resuming a Chat after unexpected network disconnections and for picking up conversations exactly where you left off at a later time. This ensures preserved context across multiple sessions.

There are three ways to obtain the Chat Group ID:

Chat Metadata: Upon establishing a WebSocket connection with EVI, the user receives a Chat Metadata message. This message contains a chat_group_id, which can be used to resume conversations within this chat group in future sessions.

List Chats endpoint: Use the GET /v0/evi/chats endpoint to obtain the Chat Group ID of individual Chat sessions. This endpoint lists all available Chat sessions and their associated Chat Group ID.

List Chat Groups endpoint: Use the GET /v0/evi/chat_groups endpoint to obtain the Chat Group IDs of all Chat Groups associated with an API key. This endpoint returns a list of all available chat groups.

verbose_transcription
boolean
Optional
Defaults to false
A flag to enable verbose transcription. Set this query parameter to true to have unfinalized user transcripts be sent to the client as interim UserMessage messages. The interim field on a UserMessage denotes whether the message is “interim” or “final.”

access_token
string
Optional
Access token used for authenticating the client. If not provided, an api_key must be provided to authenticate.

The access token is generated using both an API key and a Secret key, which provides an additional layer of security compared to using just an API key.

For more details, refer to the Authentication Strategies Guide.

api_key
string
Optional
API key used for authenticating the client. If not provided, an access_token must be provided to authenticate.

For more details, refer to the Authentication Strategies Guide.

Send
Audio Input
object

Hide 3 properties
type
"audio_input"
Required
The type of message sent through the socket; must be audio_input for our server to correctly identify and process it as an Audio Input message.

This message is used for sending audio input data to EVI for processing and expression measurement. Audio data should be sent as a continuous stream, encoded in Base64.

data
string
Required
Base64 encoded audio input to insert into the conversation.

The content of an Audio Input message is treated as the user’s speech to EVI and must be streamed continuously. Pre-recorded audio files are not supported.

For optimal transcription quality, the audio data should be transmitted in small chunks.

Hume recommends streaming audio with a buffer window of 20 milliseconds (ms), or 100 milliseconds (ms) for web applications.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

OR
Session Settings
object

Hide 10 properties
type
"session_settings"
Required
The type of message sent through the socket; must be session_settings for our server to correctly identify and process it as a Session Settings message.

Session settings are temporary and apply only to the current Chat session. These settings can be adjusted dynamically based on the requirements of each session to ensure optimal performance and user experience.

For more information, please refer to the Session Settings section on the EVI Configuration page.

custom_session_id
string
Optional
Unique identifier for the session. Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

If included, the response sent from Hume to your backend will include this ID. This allows you to correlate frontend users with their incoming messages.

It is recommended to pass a custom_session_id if you are using a Custom Language Model. Please see our guide to using a custom language model with EVI to learn more.

system_prompt
string
Optional
Instructions used to shape EVI’s behavior, responses, and style for the session.

When included in a Session Settings message, the provided Prompt overrides the existing one specified in the EVI configuration. If no Prompt was defined in the configuration, this Prompt will be the one used for the session.

You can use the Prompt to define a specific goal or role for EVI, specifying how it should act or what it should focus on during the conversation. For example, EVI can be instructed to act as a customer support representative, a fitness coach, or a travel advisor, each with its own set of behaviors and response styles.

For help writing a system prompt, see our Prompting Guide.

context
object
Optional
Allows developers to inject additional context into the conversation, which is appended to the end of user messages for the session.

When included in a Session Settings message, the provided context can be used to remind the LLM of its role in every user message, prevent it from forgetting important details, or add new relevant information to the conversation.

Set to null to disable context injection.


Hide 2 properties
text
string
Required
The context to be injected into the conversation. Helps inform the LLM’s response by providing relevant information about the ongoing conversation.

This text will be appended to the end of user messages based on the chosen persistence level. For example, if you want to remind EVI of its role as a helpful weather assistant, the context you insert will be appended to the end of user messages as {Context: You are a helpful weather assistant}.

type
enum
Optional
Allowed values:
editable
persistent
temporary
The persistence level of the injected context. Specifies how long the injected context will remain active in the session.

There are three possible context types:

Persistent: The context is appended to all user messages for the duration of the session.

Temporary: The context is appended only to the next user message.

Editable: The original context is updated to reflect the new context.

If the type is not specified, it will default to temporary.

audio
object
Optional
Configuration details for the audio input used during the session. Ensures the audio is being correctly set up for processing.

This optional field is only required when the audio input is encoded in PCM Linear 16 (16-bit, little-endian, signed PCM WAV data). For detailed instructions on how to configure session settings for PCM Linear 16 audio, please refer to the Session Settings section on the EVI Configuration page.


Hide 3 properties
encoding
"linear16"
Required
Encoding format of the audio input, such as linear16.

channels
integer
Required
Number of audio channels.

sample_rate
integer
Required
Audio sample rate. Number of samples per second in the audio input, measured in Hertz.

language_model_api_key
string
Optional
Third party API key for the supplemental language model.

When provided, EVI will use this key instead of Hume’s API key for the supplemental LLM. This allows you to bypass rate limits and utilize your own API key as needed.

tools
list of objects
Optional
List of user-defined tools to enable for the session.

Tools are resources used by EVI to perform various tasks, such as searching the web or calling external APIs. Built-in tools, like web search, are natively integrated, while user-defined tools are created and invoked by the user. To learn more, see our Tool Use Guide.


Hide 5 properties
type
"builtin" or "function"
Required
Allowed values:
builtin
function
Type of tool. Set to function for user-defined tools.

name
string
Required
Name of the user-defined tool to be enabled.

parameters
string
Required
Parameters of the tool. Is a stringified JSON schema.

These parameters define the inputs needed for the tool’s execution, including the expected data type and description for each input field. Structured as a JSON schema, this format ensures the tool receives data in the expected format.

description
string
Optional
An optional description of what the tool does, used by the supplemental LLM to choose when and how to call the function.

fallback_content
string
Optional
Optional text passed to the supplemental LLM if the tool call fails. The LLM then uses this text to generate a response back to the user, ensuring continuity in the conversation.

builtin_tools
list of objects
Optional
List of built-in tools to enable for the session.

Tools are resources used by EVI to perform various tasks, such as searching the web or calling external APIs. Built-in tools, like web search, are natively integrated, while user-defined tools are created and invoked by the user. To learn more, see our Tool Use Guide.

Currently, the only built-in tool Hume provides is Web Search. When enabled, Web Search equips EVI with the ability to search the web for up-to-date information.


Hide 2 properties
name
"web_search" or "hang_up"
Required
Allowed values:
web_search
hang_up
Name of the built-in tool. Set to web_search to equip EVI with the built-in Web Search tool.

fallback_content
string
Optional
Optional text passed to the supplemental LLM if the tool call fails. The LLM then uses this text to generate a response back to the user, ensuring continuity in the conversation.

metadata
map from strings to any
Optional
variables
map from strings to strings or doubles or booleans
Optional
This field allows you to assign values to dynamic variables referenced in your system prompt.

Each key represents the variable name, and the corresponding value is the specific content you wish to assign to that variable within the session. While the values for variables can be strings, numbers, or booleans, the value will ultimately be converted to a string when injected into your system prompt.

Using this field, you can personalize responses based on session-specific details. For more guidance, see our guide on using dynamic variables.


Hide 3 variants
abc
string
OR
1.2
double
OR
true
boolean
OR
User Input
object

Hide 3 properties
type
"user_input"
Required
The type of message sent through the socket; must be user_input for our server to correctly identify and process it as a User Input message.

text
string
Required
User text to insert into the conversation. Text sent through a User Input message is treated as the user’s speech to EVI. EVI processes this input and provides a corresponding response.

Expression measurement results are not available for User Input messages, as the prosody model relies on audio input and cannot process text alone.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

OR
Assistant Input
object

Hide 3 properties
type
"assistant_input"
Required
The type of message sent through the socket; must be assistant_input for our server to correctly identify and process it as an Assistant Input message.

text
string
Required
Assistant text to synthesize into spoken audio and insert into the conversation.

EVI uses this text to generate spoken audio using our proprietary expressive text-to-speech model. Our model adds appropriate emotional inflections and tones to the text based on the user’s expressions and the context of the conversation. The synthesized audio is streamed back to the user as an Assistant Message.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

OR
Tool Response Message
object

Hide 6 properties
type
"tool_response"
Required
The type of message sent through the socket; for a Tool Response message, this must be tool_response.

Upon receiving a Tool Call message and successfully invoking the function, this message is sent to convey the result of the function call back to EVI.

tool_call_id
string
Required
The unique identifier for a specific tool call instance.

This ID is used to track the request and response of a particular tool invocation, ensuring that the correct response is linked to the appropriate request. The specified tool_call_id must match the one received in the Tool Call message.

content
string
Required
Return value of the tool call. Contains the output generated by the tool to pass back to EVI.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

tool_name
string
Optional
Name of the tool.

Include this optional field to help the supplemental LLM identify which tool generated the response. The specified tool_name must match the one received in the Tool Call message.

tool_type
"builtin" or "function"
Optional
Allowed values:
builtin
function
Type of tool called. Either builtin for natively implemented tools, like web search, or function for user-defined tools.

OR
Tool Error Message
object

Hide 8 properties
type
"tool_error"
Required
The type of message sent through the socket; for a Tool Error message, this must be tool_error.

Upon receiving a Tool Call message and failing to invoke the function, this message is sent to notify EVI of the tool’s failure.

tool_call_id
string
Required
The unique identifier for a specific tool call instance.

This ID is used to track the request and response of a particular tool invocation, ensuring that the Tool Error message is linked to the appropriate tool call request. The specified tool_call_id must match the one received in the Tool Call message.

error
string
Required
Error message from the tool call, not exposed to the LLM or user.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

tool_type
"builtin" or "function"
Optional
Allowed values:
builtin
function
Type of tool called. Either builtin for natively implemented tools, like web search, or function for user-defined tools.

content
string
Optional
Optional text passed to the supplemental LLM in place of the tool call result. The LLM then uses this text to generate a response back to the user, ensuring continuity in the conversation if the tool errors.

code
string
Optional
Error code. Identifies the type of error encountered.

level
"warn"
Optional
Defaults to warn
Indicates the severity of an error; for a Tool Error message, this must be warn to signal an unexpected event.

OR
Pause Assistant Message
object

Hide 2 properties
type
"pause_assistant_message"
Required
The type of message sent through the socket; must be pause_assistant_message for our server to correctly identify and process it as a Pause Assistant message.

Once this message is sent, EVI will not respond until a Resume Assistant message is sent. When paused, EVI won’t respond, but transcriptions of your audio inputs will still be recorded.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

OR
Resume Assistant Message
object

Hide 2 properties
type
"resume_assistant_message"
Required
The type of message sent through the socket; must be resume_assistant_message for our server to correctly identify and process it as a Resume Assistant message.

Upon resuming, if any audio input was sent during the pause, EVI will retain context from all messages sent but only respond to the last user message. (e.g., If you ask EVI two questions while paused and then send a resume_assistant_message, EVI will respond to the second question and have added the first question to its conversation context.)

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

Receive
Assistant End
object

Hide 2 properties
type
"assistant_end"
Required
The type of message sent through the socket; for an Assistant End message, this must be assistant_end.

This message indicates the conclusion of the assistant’s response, signaling that the assistant has finished speaking for the current conversational turn.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

OR
Assistant Message
object

Hide 6 properties
type
"assistant_message"
Required
The type of message sent through the socket; for an Assistant Message, this must be assistant_message.

This message contains both a transcript of the assistant’s response and the expression measurement predictions of the assistant’s audio output.

message
object
Required
Transcript of the message.


Hide 4 properties
role
enum
Required
Allowed values:
assistant
system
user
all
tool
Role of who is providing the message.

content
string
Optional
Transcript of the message.

tool_call
object
Optional
Function call name and arguments.


Hide 7 properties
name
string
Required
Name of the tool called.

parameters
string
Required
Parameters of the tool.

These parameters define the inputs needed for the tool’s execution, including the expected data type and description for each input field. Structured as a stringified JSON schema, this format ensures the tool receives data in the expected format.

tool_call_id
string
Required
The unique identifier for a specific tool call instance.

This ID is used to track the request and response of a particular tool invocation, ensuring that the correct response is linked to the appropriate request.

type
"tool_call"
Required
The type of message sent through the socket; for a Tool Call message, this must be tool_call.

This message indicates that the supplemental LLM has detected a need to invoke the specified tool.

response_required
boolean
Required
Indicates whether a response to the tool call is required from the developer, either in the form of a Tool Response message or a Tool Error message.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

tool_type
"builtin" or "function"
Optional
Allowed values:
builtin
function
Type of tool called. Either builtin for natively implemented tools, like web search, or function for user-defined tools.

tool_result
object
Optional
Function call response from client.


Hide 2 variants
Tool Response Message
object

Hide 6 properties
type
"tool_response"
Required
The type of message sent through the socket; for a Tool Response message, this must be tool_response.

Upon receiving a Tool Call message and successfully invoking the function, this message is sent to convey the result of the function call back to EVI.

tool_call_id
string
Required
The unique identifier for a specific tool call instance.

This ID is used to track the request and response of a particular tool invocation, ensuring that the correct response is linked to the appropriate request. The specified tool_call_id must match the one received in the Tool Call message.

content
string
Required
Return value of the tool call. Contains the output generated by the tool to pass back to EVI.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

tool_name
string
Optional
Name of the tool.

Include this optional field to help the supplemental LLM identify which tool generated the response. The specified tool_name must match the one received in the Tool Call message.

tool_type
"builtin" or "function"
Optional
Allowed values:
builtin
function
Type of tool called. Either builtin for natively implemented tools, like web search, or function for user-defined tools.

OR
Tool Error Message
object

Hide 8 properties
type
"tool_error"
Required
The type of message sent through the socket; for a Tool Error message, this must be tool_error.

Upon receiving a Tool Call message and failing to invoke the function, this message is sent to notify EVI of the tool’s failure.

tool_call_id
string
Required
The unique identifier for a specific tool call instance.

This ID is used to track the request and response of a particular tool invocation, ensuring that the Tool Error message is linked to the appropriate tool call request. The specified tool_call_id must match the one received in the Tool Call message.

error
string
Required
Error message from the tool call, not exposed to the LLM or user.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

tool_type
"builtin" or "function"
Optional
Allowed values:
builtin
function
Type of tool called. Either builtin for natively implemented tools, like web search, or function for user-defined tools.

content
string
Optional
Optional text passed to the supplemental LLM in place of the tool call result. The LLM then uses this text to generate a response back to the user, ensuring continuity in the conversation if the tool errors.

code
string
Optional
Error code. Identifies the type of error encountered.

level
"warn"
Optional
Defaults to warn
Indicates the severity of an error; for a Tool Error message, this must be warn to signal an unexpected event.

models
object
Required
Inference model results.


Hide property
prosody
object
Optional
Prosody model inference results.

EVI uses the prosody model to measure 48 emotions related to speech and vocal characteristics within a given expression.


Hide property
scores
object
Required
The confidence scores for 48 emotions within the detected expression of an audio sample.

Scores typically range from 0 to 1, with higher values indicating a stronger confidence level in the measured attribute.

See our guide on interpreting expression measurement results to learn more.


Hide 48 properties
Admiration
double
Required
Adoration
double
Required
Aesthetic Appreciation
double
Required
Amusement
double
Required
Anger
double
Required
Anxiety
double
Required
Awe
double
Required
Awkwardness
double
Required
Boredom
double
Required
Calmness
double
Required
Concentration
double
Required
Confusion
double
Required
Contemplation
double
Required
Contempt
double
Required
Contentment
double
Required
Craving
double
Required
Desire
double
Required
Determination
double
Required
Disappointment
double
Required
Disgust
double
Required
Distress
double
Required
Doubt
double
Required
Ecstasy
double
Required
Embarrassment
double
Required
Empathic Pain
double
Required
Entrancement
double
Required
Envy
double
Required
Excitement
double
Required
Fear
double
Required
Guilt
double
Required
Horror
double
Required
Interest
double
Required
Joy
double
Required
Love
double
Required
Nostalgia
double
Required
Pain
double
Required
Pride
double
Required
Realization
double
Required
Relief
double
Required
Romance
double
Required
Sadness
double
Required
Satisfaction
double
Required
Shame
double
Required
Surprise (negative)
double
Required
Surprise (positive)
double
Required
Sympathy
double
Required
Tiredness
double
Required
Triumph
double
Required
from_text
boolean
Required
Indicates if this message was inserted into the conversation as text from an Assistant Input message.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

id
string
Optional
ID of the assistant message. Allows the Assistant Message to be tracked and referenced.

OR
Audio Output
object

Hide 5 properties
type
"audio_output"
Required
The type of message sent through the socket; for an Audio Output message, this must be audio_output.

id
string
Required
ID of the audio output. Allows the Audio Output message to be tracked and referenced.

index
integer
Required
Index of the chunk of audio relative to the whole audio segment.

data
string
Required
Base64 encoded audio output. This encoded audio is transmitted to the client, where it can be decoded and played back as part of the user interaction.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

OR
Chat Metadata
object

Hide 5 properties
type
"chat_metadata"
Required
The type of message sent through the socket; for a Chat Metadata message, this must be chat_metadata.

The Chat Metadata message is the first message you receive after establishing a connection with EVI and contains important identifiers for the current Chat session.

chat_group_id
string
Required
ID of the Chat Group.

Used to resume a Chat when passed in the resumed_chat_group_id query parameter of a subsequent connection request. This allows EVI to continue the conversation from where it left off within the Chat Group.

Learn more about supporting chat resumability from the EVI FAQ.

chat_id
string
Required
ID of the Chat session. Allows the Chat session to be tracked and referenced.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

request_id
string
Optional
ID of the initiating request.

OR
Web Socket Error
object

Hide 5 properties
type
"error"
Required
The type of message sent through the socket; for a Web Socket Error message, this must be error.

This message indicates a disruption in the WebSocket connection, such as an unexpected disconnection, protocol error, or data transmission issue.

code
string
Required
Error code. Identifies the type of error encountered.

slug
string
Required
Short, human-readable identifier and description for the error. See a complete list of error slugs on the Errors page.

message
string
Required
Detailed description of the error.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

OR
User Interruption
object

Hide 3 properties
type
"user_interruption"
Required
The type of message sent through the socket; for a User Interruption message, this must be user_interruption.

This message indicates the user has interrupted the assistant’s response. EVI detects the interruption in real-time and sends this message to signal the interruption event. This message allows the system to stop the current audio playback, clear the audio queue, and prepare to handle new user input.

time
integer
Required
Unix timestamp of the detected user interruption.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

OR
User Message
object

Hide 7 properties
type
"user_message"
Required
The type of message sent through the socket; for a User Message, this must be user_message.

This message contains both a transcript of the user’s input and the expression measurement predictions if the input was sent as an Audio Input message. Expression measurement predictions are not provided for a User Input message, as the prosody model relies on audio input and cannot process text alone.

message
object
Required
Transcript of the message.


Hide 4 properties
role
enum
Required
Allowed values:
assistant
system
user
all
tool
Role of who is providing the message.

content
string
Optional
Transcript of the message.

tool_call
object
Optional
Function call name and arguments.


Hide 7 properties
name
string
Required
Name of the tool called.

parameters
string
Required
Parameters of the tool.

These parameters define the inputs needed for the tool’s execution, including the expected data type and description for each input field. Structured as a stringified JSON schema, this format ensures the tool receives data in the expected format.

tool_call_id
string
Required
The unique identifier for a specific tool call instance.

This ID is used to track the request and response of a particular tool invocation, ensuring that the correct response is linked to the appropriate request.

type
"tool_call"
Required
The type of message sent through the socket; for a Tool Call message, this must be tool_call.

This message indicates that the supplemental LLM has detected a need to invoke the specified tool.

response_required
boolean
Required
Indicates whether a response to the tool call is required from the developer, either in the form of a Tool Response message or a Tool Error message.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

tool_type
"builtin" or "function"
Optional
Allowed values:
builtin
function
Type of tool called. Either builtin for natively implemented tools, like web search, or function for user-defined tools.

tool_result
object
Optional
Function call response from client.


Hide 2 variants
Tool Response Message
object

Hide 6 properties
type
"tool_response"
Required
The type of message sent through the socket; for a Tool Response message, this must be tool_response.

Upon receiving a Tool Call message and successfully invoking the function, this message is sent to convey the result of the function call back to EVI.

tool_call_id
string
Required
The unique identifier for a specific tool call instance.

This ID is used to track the request and response of a particular tool invocation, ensuring that the correct response is linked to the appropriate request. The specified tool_call_id must match the one received in the Tool Call message.

content
string
Required
Return value of the tool call. Contains the output generated by the tool to pass back to EVI.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

tool_name
string
Optional
Name of the tool.

Include this optional field to help the supplemental LLM identify which tool generated the response. The specified tool_name must match the one received in the Tool Call message.

tool_type
"builtin" or "function"
Optional
Allowed values:
builtin
function
Type of tool called. Either builtin for natively implemented tools, like web search, or function for user-defined tools.

OR
Tool Error Message
object

Hide 8 properties
type
"tool_error"
Required
The type of message sent through the socket; for a Tool Error message, this must be tool_error.

Upon receiving a Tool Call message and failing to invoke the function, this message is sent to notify EVI of the tool’s failure.

tool_call_id
string
Required
The unique identifier for a specific tool call instance.

This ID is used to track the request and response of a particular tool invocation, ensuring that the Tool Error message is linked to the appropriate tool call request. The specified tool_call_id must match the one received in the Tool Call message.

error
string
Required
Error message from the tool call, not exposed to the LLM or user.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

tool_type
"builtin" or "function"
Optional
Allowed values:
builtin
function
Type of tool called. Either builtin for natively implemented tools, like web search, or function for user-defined tools.

content
string
Optional
Optional text passed to the supplemental LLM in place of the tool call result. The LLM then uses this text to generate a response back to the user, ensuring continuity in the conversation if the tool errors.

code
string
Optional
Error code. Identifies the type of error encountered.

level
"warn"
Optional
Defaults to warn
Indicates the severity of an error; for a Tool Error message, this must be warn to signal an unexpected event.

models
object
Required
Inference model results.


Hide property
prosody
object
Optional
Prosody model inference results.

EVI uses the prosody model to measure 48 emotions related to speech and vocal characteristics within a given expression.


Hide property
scores
object
Required
The confidence scores for 48 emotions within the detected expression of an audio sample.

Scores typically range from 0 to 1, with higher values indicating a stronger confidence level in the measured attribute.

See our guide on interpreting expression measurement results to learn more.


Hide 48 properties
Admiration
double
Required
Adoration
double
Required
Aesthetic Appreciation
double
Required
Amusement
double
Required
Anger
double
Required
Anxiety
double
Required
Awe
double
Required
Awkwardness
double
Required
Boredom
double
Required
Calmness
double
Required
Concentration
double
Required
Confusion
double
Required
Contemplation
double
Required
Contempt
double
Required
Contentment
double
Required
Craving
double
Required
Desire
double
Required
Determination
double
Required
Disappointment
double
Required
Disgust
double
Required
Distress
double
Required
Doubt
double
Required
Ecstasy
double
Required
Embarrassment
double
Required
Empathic Pain
double
Required
Entrancement
double
Required
Envy
double
Required
Excitement
double
Required
Fear
double
Required
Guilt
double
Required
Horror
double
Required
Interest
double
Required
Joy
double
Required
Love
double
Required
Nostalgia
double
Required
Pain
double
Required
Pride
double
Required
Realization
double
Required
Relief
double
Required
Romance
double
Required
Sadness
double
Required
Satisfaction
double
Required
Shame
double
Required
Surprise (negative)
double
Required
Surprise (positive)
double
Required
Sympathy
double
Required
Tiredness
double
Required
Triumph
double
Required
time
object
Required
Start and End time of user message.


Hide 2 properties
begin
integer
Required
Start time of the interval in milliseconds.

end
integer
Required
End time of the interval in milliseconds.

from_text
boolean
Required
Indicates if this message was inserted into the conversation as text from a User Input message.

interim
boolean
Required
Indicates if this message contains an immediate and unfinalized transcript of the user’s audio input. If it does, words may be repeated across successive UserMessage messages as our transcription model becomes more confident about what was said with additional context. Interim messages are useful to detect if the user is interrupting during audio playback on the client. Even without a finalized transcription, along with UserInterrupt messages, interim UserMessages are useful for detecting if the user is interrupting during audio playback on the client, signaling to stop playback in your application. Interim UserMessages will only be received if the verbose_transcription query parameter is set to true in the handshake request.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

OR
Tool Call Message
object

Hide 7 properties
name
string
Required
Name of the tool called.

parameters
string
Required
Parameters of the tool.

These parameters define the inputs needed for the tool’s execution, including the expected data type and description for each input field. Structured as a stringified JSON schema, this format ensures the tool receives data in the expected format.

tool_call_id
string
Required
The unique identifier for a specific tool call instance.

This ID is used to track the request and response of a particular tool invocation, ensuring that the correct response is linked to the appropriate request.

type
"tool_call"
Required
The type of message sent through the socket; for a Tool Call message, this must be tool_call.

This message indicates that the supplemental LLM has detected a need to invoke the specified tool.

response_required
boolean
Required
Indicates whether a response to the tool call is required from the developer, either in the form of a Tool Response message or a Tool Error message.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

tool_type
"builtin" or "function"
Optional
Allowed values:
builtin
function
Type of tool called. Either builtin for natively implemented tools, like web search, or function for user-defined tools.

OR
Tool Response Message
object

Hide 6 properties
type
"tool_response"
Required
The type of message sent through the socket; for a Tool Response message, this must be tool_response.

Upon receiving a Tool Call message and successfully invoking the function, this message is sent to convey the result of the function call back to EVI.

tool_call_id
string
Required
The unique identifier for a specific tool call instance.

This ID is used to track the request and response of a particular tool invocation, ensuring that the correct response is linked to the appropriate request. The specified tool_call_id must match the one received in the Tool Call message.

content
string
Required
Return value of the tool call. Contains the output generated by the tool to pass back to EVI.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

tool_name
string
Optional
Name of the tool.

Include this optional field to help the supplemental LLM identify which tool generated the response. The specified tool_name must match the one received in the Tool Call message.

tool_type
"builtin" or "function"
Optional
Allowed values:
builtin
function
Type of tool called. Either builtin for natively implemented tools, like web search, or function for user-defined tools.

OR
Tool Error Message
object

Hide 8 properties
type
"tool_error"
Required
The type of message sent through the socket; for a Tool Error message, this must be tool_error.

Upon receiving a Tool Call message and failing to invoke the function, this message is sent to notify EVI of the tool’s failure.

tool_call_id
string
Required
The unique identifier for a specific tool call instance.

This ID is used to track the request and response of a particular tool invocation, ensuring that the Tool Error message is linked to the appropriate tool call request. The specified tool_call_id must match the one received in the Tool Call message.

error
string
Required
Error message from the tool call, not exposed to the LLM or user.

custom_session_id
string
Optional
Used to manage conversational state, correlate frontend and backend data, and persist conversations across EVI sessions.

tool_type
"builtin" or "function"
Optional
Allowed values:
builtin
function
Type of tool called. Either builtin for natively implemented tools, like web search, or function for user-defined tools.

content
string
Optional
Optional text passed to the supplemental LLM in place of the tool call result. The LLM then uses this text to generate a response back to the user, ensuring continuity in the conversation if the tool errors.

code
string
Optional
Error code. Identifies the type of error encountered.

level
"warn"
Optional
Defaults to warn
Indicates the severity of an error; for a Tool Error message, this must be warn to signal an unexpected event.

Handshake

Play
URL	wss://api.hume.ai/v0/evi/chat
Method	GET
Status	101 Switching Protocols
Messages

{"type":"audio_input","data":"data"}
publish

{
  "type": "audio_input",
  "data": "data"
}

{"type":"assistant_end"}
subscribe

{
  "type": "assistant_end"
}
Built with