#!/usr/bin/env node
/**
 * GPREG Identity Generator
 * Generates realistic but fake UK identities for NHS registration testing.
 * Outputs one JSON persona per call, or a batch.
 */

const titles = ['Mr', 'Mrs', 'Miss', 'Ms', 'Dr'];
const givenNames = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa',
  'Timothy', 'Deborah', 'Ronald', 'Stephanie', 'Edward', 'Rebecca', 'Jason', 'Sharon',
  'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
  'Nicholas', 'Angela', 'Eric', 'Shirley', 'Jonathan', 'Anna', 'Stephen', 'Brenda',
  'Larry', 'Pamela', 'Justin', 'Emma', 'Scott', 'Nicole', 'Brandon', 'Helen',
  'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Raymond', 'Christine', 'Gregory', 'Debra',
  'Frank', 'Rachel', 'Alexander', 'Carolyn', 'Patrick', 'Janet', 'Jack', 'Catherine',
  'Dennis', 'Maria', 'Jerry', 'Heather'
];
const surnames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
  'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
  'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
  'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza',
  'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers',
  'Long', 'Ross', 'Foster', 'Jimenez'
];
const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const phonePrefixes = ['07700','07701','07702','07703','07704','07705','07706','07707','07708','07709'];
const postcodeOutcodes = [
  'E1','E2','E3','E4','E5','E6','E7','E8','E9','E10','E11','E12','E14','E15','E16','E17',
  'EC1','EC2','N1','N2','N4','N5','N7','N8','N10','N11','N12','N14','N15','N16','N17','N19',
  'N20','N21','N22','NW1','NW2','NW3','NW5','NW6','NW8','NW10','SE1','SE5','SE10','SE15',
  'SW1','SW3','SW6','SW11','SW15','W1','W2','W4','W6','W8','W9','W10','W11','W12','W14',
  'WC1','WC2',
  // Fake postcodes (NHS test range)
  'ZZ99'
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generateIdentity(seed) {
  // Use fresh Math.random() for non-seeded to avoid repeat issue
  const pick = (arr, r) => arr[Math.floor((r || Math.random)() * arr.length)];

  const title = pick(titles, Math.random);
  const givenName = pick(givenNames, Math.random);
  const surname = pick(surnames, Math.random);
  const dobYear = randInt(1945, 2005);
  const dobMonth = pick(months);
  const dobDay = String(randInt(1, 28)).padStart(2, '0');
  const phone = pick(phonePrefixes) + String(randInt(100000, 999999));
  const emailBase = givenName.toLowerCase() + '.' + surname.toLowerCase();
  const email = emailBase + '@mail.com';

  // Use real NW London postcode (Stonebridge Practice catchment area)
  const postcode = "NW10 8SB";
  const houseNumber = String(randInt(1, 999));

  // Don't generate NHS number — real people rarely know theirs offhand
  const nhsNumber = '';
  const nhsNumberKnown = false;

  return {
    title,
    givenName,
    middleName: '',
    surname,
    previousSurname: '',
    dobDay,
    dobMonth,
    dobYear: String(dobYear),
    phone,
    mobilePhone: phone,
    email,
    postcode,
    houseNumber,
    nhsNumber,
    nhsNumberKnown: false,
    sex: pick(['male', 'female'], Math.random),
    ethnicity: 'Prefer not to say',
    emergencyContact: 'Emergency Contact',
    emergencyPhone: pick(phonePrefixes) + String(randInt(100000, 999999)),
    emergencyRelation: pick(['Friend', 'Spouse', 'Parent', 'Sibling', 'Partner']),
    yearBorn: String(dobYear),
    // For reference tracking
    id: Date.now().toString(36) + randInt(100, 999),
  };
}

function generateNhsNumber() {
  // NHS numbers are 10 digits, last digit is check digit
  // Using modulus 11 algorithm
  const digits = [];
  for (let i = 0; i < 9; i++) digits.push(randInt(0, 9));
  let sum = 0;
  const multipliers = [10, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 9; i++) sum += digits[i] * multipliers[i];
  let check = 11 - (sum % 11);
  if (check === 11) check = 0;
  if (check === 10) {
    // Invalid — regenerate
    return generateNhsNumber();
  }
  digits.push(check);
  return digits.join('');
}

function seededRandom(seed) {
  // Simple LCG for reproducibility
  let s = seed;
  return {
    random: () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    }
  };
}

// CLI
if (require.main === module) {
  const count = parseInt(process.argv[2]) || 1;
  const seed = process.argv[3] ? parseInt(process.argv[3]) : null;
  const results = [];
  for (let i = 0; i < count; i++) {
    const id = generateIdentity(seed ? seed + i : null);
    results.push(id);
  }
  if (count === 1) {
    console.log(JSON.stringify(results[0], null, 2));
    // Also print quick reference
    const r = results[0];
    console.log(`\n📋 ${r.title} ${r.givenName} ${r.surname}`);
    console.log(`   DOB: ${r.dobDay}/${r.dobMonth}/${r.dobYear}`);
    console.log(`   NHS: ${r.nhsNumber}`);
    console.log(`   Addr: ${r.houseNumber} ${r.postcode}`);
    console.log(`   Phone: ${r.phone}`);
    console.log(`   Email: ${r.email}`);
  } else {
    console.log(JSON.stringify(results, null, 2));
    console.log(`\nGenerated ${count} identities`);
  }
}

module.exports = { generateIdentity };
