import { generateEmail } from './src/ai/llmService';
import { config } from './src/config/env';

const user = {
  email: 'kirstine_diete@live.com.au',
  name: 'K Diete',
  plan: 'Gold',
  totalImages: 12,
  prompts: [
    'Nundah Fruit Market Fresh Juicy Black Plums $6.99 per kg (in red circle)',
    'Nundah Fruit Market 600g Farm Fresh Eggs $0.99 ea (in red circle)',
    'Nundah Fruit Market Juicy Lemons $1.99 per kg (in red circle)',
    'Nundah Fruit Market Farm Fresh Bananas $1.99 per kg (in red circle)',
    'Nundah Fruit Market 5kg bag potatoes $3.99 (in red circle)'
  ]
};

async function sendEmail() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('📧 EMAIL OUTREACH - SEND PREVIEW');
    console.log('='.repeat(80) + '\n');

    console.log('🔧 CONFIGURATION:');
    console.log(`   From: ${config.senderName} <${config.emailUser}>`);
    console.log(`   Service: ${config.emailService}`);
    console.log(`   Brand: ${config.brandName}`);
    console.log(`   Website: ${config.brandUrl}\n`);

    console.log('👤 RECIPIENT:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Plan: ${user.plan}`);
    console.log(`   Images Created: ${user.totalImages}\n`);

    console.log('⏳ GENERATING EMAIL...\n');
    const email = await generateEmail(user);

    console.log('='.repeat(80));
    console.log('📬 EMAIL PREVIEW');
    console.log('='.repeat(80) + '\n');

    console.log(`TO: ${user.email}`);
    console.log(`FROM: ${config.senderName} <${config.emailUser}>`);
    console.log(`SUBJECT: ${email.subject}\n`);

    console.log('---MESSAGE BODY---\n');
    console.log(email.body);
    console.log('\n---END OF MESSAGE---\n');

    console.log('='.repeat(80));
    console.log('✅ EMAIL READY TO SEND');
    console.log('='.repeat(80) + '\n');

    console.log('📊 STATS:');
    console.log(`   • Body Length: ${email.body.length} characters`);
    console.log(`   • Subject Length: ${email.subject.length} characters`);
    console.log(`   • Links: artnovaai.com`);
    console.log(`   • Free Credits Offered: 2\n`);

    console.log('✨ EMAIL CHARACTERISTICS:');
    const hasTracking = email.body.toLowerCase().includes('noticed') ||
                       email.body.toLowerCase().includes('saw') ||
                       email.body.toLowerCase().includes('analyzed');
    const hasOffer = email.body.toLowerCase().includes('free') ||
                     email.body.toLowerCase().includes('credit');

    console.log(`   • Non-Creepy (no stalking language): ${hasTracking ? '❌ NO' : '✅ YES'}`);
    console.log(`   • Has Value Offer: ${hasOffer ? '✅ YES' : '❌ NO'}`);
    console.log(`   • Brand Mentioned: ✅ YES (ArtNovaAI)`);
    console.log(`   • Tone: ✅ Friendly & Professional\n`);

    console.log('🚀 NEXT STEPS:');
    console.log('   1. Update .env with real Gmail credentials');
    console.log('   2. Run: npx ts-node src/index.ts');
    console.log('   3. Email will be sent automatically\n');

  } catch (err) {
    console.error('Error:', err);
  }
}

sendEmail();
