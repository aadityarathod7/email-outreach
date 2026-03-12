import Imap from 'imap';

const imap = new Imap({
  user: 'aayushi@artnovaai.com',
  password: 'cosx pvew uugv wtwd',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

function imaplogin() {
  imap.openBox('INBOX', false, function(err: any, box: any) {
    if (err) throw err;
    console.log('✅ Successfully authenticated!');
    console.log(`Total messages: ${box.messages}`);
    imap.end();
  });
}

imap.on('ready', imaplogin);

imap.on('error', function(err: any) {
  console.log('❌ Error:', err.message);
  console.log('\nPossible issues:');
  console.log('1. App password incorrect');
  console.log('2. Gmail security settings blocking access');
  console.log('3. Two-factor authentication not enabled');
  process.exit(1);
});

imap.on('end', function() {
  console.log('Connection ended');
});

console.log('Attempting to connect to IMAP...');
imap.connect();

setTimeout(() => {
  console.log('❌ Connection timeout - credentials likely incorrect');
  process.exit(1);
}, 10000);
