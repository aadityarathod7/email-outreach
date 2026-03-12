import { generateEmail } from './src/ai/llmService';
import { sendEmail } from './src/sender/emailSender';
import { config } from './src/config/env';

const user = {
  email: 'aadityarathod7@gmail.com',
  name: 'Aaditya Test',
  plan: 'Gold',
  totalImages: 20,
  prompts: ['Test email to verify primary inbox']
};

async function test() {
  try {
    console.log('\n🚀 TESTING PRIMARY INBOX DELIVERY\n');
    console.log('Generating personalized email...');
    
    const email = await generateEmail(user);
    
    console.log('\n📧 EMAIL DETAILS:');
    console.log(`To: ${user.email}`);
    console.log(`From: ${config.senderName} <${config.emailUser}>`);
    console.log(`Subject: ${email.subject}\n`);
    console.log(`Body:\n${email.body}\n`);
    
    console.log('📤 Sending with PRIMARY INBOX HEADERS...\n');
    const sent = await sendEmail(user.email, email.subject, email.body);
    
    if (sent) {
      console.log('✅ EMAIL SENT!\n');
      console.log('📋 HEADERS APPLIED:');
      console.log('   • X-Priority: 3 (Normal) - signals personal email');
      console.log('   • X-Mailer: ArtNovaAI - identifies as from ArtNovaAI');
      console.log('   • Content-Type: text/plain - plain text only');
      console.log('   • List-Unsubscribe: provided\n');
      console.log('✨ This should land in PRIMARY INBOX, not promotional!\n');
    } else {
      console.log('❌ Failed to send\n');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
