// Google Workspace Integration Client Services
// Handles Google Drive, Gmail, Google Chat, Google Calendar, and Google Contacts

export interface WorkspaceFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  createdTime?: string;
  size?: string;
}

export interface WorkspaceEmail {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  date?: string;
}

export interface WorkspaceChatSpace {
  name: string;
  displayName: string;
  type: string;
  spaceThreadingState?: string;
}

export interface WorkspaceCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  htmlLink?: string;
  location?: string;
}

export interface WorkspaceContact {
  resourceName: string;
  name: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
}

// 1. GOOGLE DRIVE
export async function listDriveFiles(accessToken: string, query?: string): Promise<WorkspaceFile[]> {
  try {
    const q = query ? `&q=${encodeURIComponent(query)}` : '';
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,webViewLink,iconLink,createdTime,size)${q}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Google Drive API error: ${res.statusText}`);
    const data = await res.json();
    return data.files || [];
  } catch (error) {
    console.error('Failed to list Drive files:', error);
    throw error;
  }
}

export async function uploadDriveFile(accessToken: string, fileName: string, content: string, mimeType = 'text/plain'): Promise<WorkspaceFile> {
  try {
    const metadata = {
      name: fileName,
      mimeType,
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: mimeType }));

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    });

    if (!res.ok) throw new Error(`Google Drive upload failed: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to upload file to Google Drive:', error);
    throw error;
  }
}

// 2. GMAIL
export async function listGmailMessages(accessToken: string, maxResults = 10): Promise<WorkspaceEmail[]> {
  try {
    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Gmail API error: ${res.statusText}`);
    const data = await res.json();
    const messageList = data.messages || [];

    // Fetch details for each message
    const detailedList: WorkspaceEmail[] = await Promise.all(
      messageList.slice(0, 8).map(async (msg: { id: string; threadId: string }) => {
        try {
          const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (!detailRes.ok) return { id: msg.id, threadId: msg.threadId };
          const detail = await detailRes.json();
          const headers = detail.payload?.headers || [];
          const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
          const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '';
          const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';
          return {
            id: msg.id,
            threadId: msg.threadId,
            snippet: detail.snippet,
            subject,
            from,
            date,
          };
        } catch {
          return { id: msg.id, threadId: msg.threadId };
        }
      })
    );

    return detailedList;
  } catch (error) {
    console.error('Failed to fetch Gmail messages:', error);
    throw error;
  }
}

export async function sendGmailMessage(accessToken: string, to: string, subject: string, bodyText: string): Promise<any> {
  try {
    const emailLines = [
      `To: ${to}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      '',
      bodyText,
    ];
    const email = emailLines.join('\r\n');
    const base64EncodedEmail = btoa(unescape(encodeURIComponent(email)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: base64EncodedEmail }),
    });

    if (!res.ok) throw new Error(`Failed to send Gmail: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to send email via Gmail:', error);
    throw error;
  }
}

// 3. GOOGLE CHAT
export async function listChatSpaces(accessToken: string): Promise<WorkspaceChatSpace[]> {
  try {
    const res = await fetch('https://chat.googleapis.com/v1/spaces', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Google Chat API error: ${res.statusText}`);
    const data = await res.json();
    return data.spaces || [];
  } catch (error) {
    console.error('Failed to list Google Chat spaces:', error);
    throw error;
  }
}

export async function sendChatMessage(accessToken: string, spaceName: string, messageText: string): Promise<any> {
  try {
    const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: messageText }),
    });
    if (!res.ok) throw new Error(`Failed to post to Google Chat: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to post message to Google Chat:', error);
    throw error;
  }
}

// 4. GOOGLE CALENDAR
export async function listCalendarEvents(accessToken: string): Promise<WorkspaceCalendarEvent[]> {
  try {
    const now = new Date().toISOString();
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(now)}&maxResults=15&singleEvents=true&orderBy=startTime`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Google Calendar API error: ${res.statusText}`);
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Failed to list calendar events:', error);
    throw error;
  }
}

export async function createCalendarEvent(
  accessToken: string,
  summary: string,
  description: string,
  startDateTime: string,
  endDateTime: string,
  location?: string
): Promise<WorkspaceCalendarEvent> {
  try {
    const eventBody = {
      summary,
      description,
      location,
      start: { dateTime: startDateTime },
      end: { dateTime: endDateTime },
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventBody),
    });

    if (!res.ok) throw new Error(`Failed to create calendar event: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to schedule calendar event:', error);
    throw error;
  }
}

// 5. GOOGLE CONTACTS (PEOPLE API)
export async function listContacts(accessToken: string): Promise<WorkspaceContact[]> {
  try {
    const res = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos&pageSize=30', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Google People API error: ${res.statusText}`);
    const data = await res.json();
    const connections = data.connections || [];

    return connections.map((p: any) => {
      const name = p.names?.[0]?.displayName || 'Unnamed Contact';
      const email = p.emailAddresses?.[0]?.value || '';
      const phone = p.phoneNumbers?.[0]?.value || '';
      const photoUrl = p.photos?.[0]?.url || '';
      return {
        resourceName: p.resourceName,
        name,
        email,
        phone,
        photoUrl,
      };
    });
  } catch (error) {
    console.error('Failed to list Google contacts:', error);
    throw error;
  }
}
