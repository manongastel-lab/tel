
export const sendTelegramMessage = async (botToken: string, chatId: string, text: string) => {
  if (!botToken || !chatId) {
    throw new Error('Bot Token and Chat ID are required');
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.description || 'Failed to send message');
    }
    return data;
  } catch (error) {
    console.error('Telegram API Error:', error);
    throw error;
  }
};
