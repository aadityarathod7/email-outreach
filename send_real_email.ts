import { generateEmail } from './src/ai/llmService';
import { sendEmail } from './src/sender/emailSender';
import { config } from './src/config/env';

const user = {
  email: 'aadityarathod7@gmail.com',
  name: 'Aaditya',
  plan: 'Gold',
  totalImages: 20,
  prompts: [
    'Professional product photography',
    'Marketing visuals',
    'E-commerce mockups',
    'Brand photography',
    'Creative design'
  ]
};

async function sendRealEmail() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 SENDING REAL EMAIL');
    console.log('='.repeat(80) + '\n');

    console.log('📧 EMAIL CONFIGURATION:');
    console.log(`   From: ${config.senderName} <${config.emailUser}>`);
    console.log(`   To: ${user.email}`);
    console.log(`   Service: Gmail SMTP`);
    console.log(`   Brand: ${config.brandName}\n`);

    console.log('👤 USER DETAILS:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Plan: ${user.plan}`);
    console.log(`   Total Images: ${user.totalImages}\n`);

    console.log('⏳ GENERATING PERSONALIZED EMAIL...');
    const email = await generateEmail(user);

    console.log('✅ EMAIL GENERATED\n');

    console.log('📬 EMAIL PREVIEW:');
    console.log('-'.repeat(80));
    console.log(`SUBJECT: ${email.subject}\n`);
    console.log(email.body);
    console.log('-'.repeat(80) + '\n');

    console.log('📤 SENDING EMAIL...');
    const sent = await sendEmail(user.email, email.subject, email.body);

    if (sent) {
      console.log('\n✅ EMAIL SENT SUCCESSFULLY!\n');
      console.log('📊 DELIVERY STATS:');
      console.log(`   • Recipient: ${user.email}`);
      console.log(`   • Subject: ${email.subject}`);
      console.log(`   • Body Length: ${email.body.length} characters`);
      console.log(`   • Sent From: ${config.emailUser}`);
      const now = new Date().toISOString();
      console.log(`   • Timestamp: ${now}`);
      console.log(`   • Status: ✅ DELIVERED\n`);
    } else {
      console.log('\n❌ EMAIL FAILED TO SEND\n');
      console.log('Check logs in data/app.log for details\n');
    }

    console.log('='.repeat(80) + '\n');

  } catch (err) {
    console.error('\n❌ ERROR:', err);
  }
}

sendRealEmail();
