'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2020-11-18T21:31:17.178Z',
    '2020-12-23T07:42:02.383Z',
    '2021-01-28T09:15:04.904Z',
    '2021-04-01T10:17:24.185Z',
    '2021-11-08T14:11:59.604Z',
    '2022-01-09T17:01:17.194Z',
    '2022-01-10T23:36:17.929Z',
    '2022-01-15T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2020-11-01T13:15:33.035Z',
    '2020-11-30T09:48:16.867Z',
    '2020-12-25T06:04:23.907Z',
    '2021-06-25T14:18:46.235Z',
    '2021-11-05T16:33:06.386Z',
    '2021-12-10T14:43:26.374Z',
    '2022-01-11T18:49:59.371Z',
    '2022-01-15T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

////////////////////////////////////////////////////////
// functions
const formatMovementDate = (date, locale) => {
    const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

    const daysPassed = calcDaysPassed(new Date(), date);

    if(daysPassed === 0 ) return 'Today';
    if(daysPassed === 1) return 'Yesterday';
    if(daysPassed <= 7) return `${daysPassed} days ago`;
    
    return new Intl.DateTimeFormat(locale).format(date);
}

const formatCur = (value, locale, currency) => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(value);
}

const displayMovements = (acc, sort = false) => {
    containerMovements.innerHTML = '';

    const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

    movs.forEach((mov, i) => {
        const type = mov > 0 ? 'deposit' : 'withdrawal';

        const date = new Date(acc.movementsDates[i]);
        const displayDate = formatMovementDate(date, acc.locale);

        const formattedMov = formatCur(mov, acc.locale, acc.currency);

        const html = `
            <div class="movements__row">
                <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
                <div class="movements__date">${displayDate}</div>
                <div class="movements__value">${formattedMov}</div>
            </div>
        `;

        containerMovements.insertAdjacentHTML('afterbegin', html);
    })
}

// calculate and display balance
const calcDisplayBalance = acc => {
    acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

    labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
}

// calculate and display summary
const calcDisplaySummary = acc => {
    const incomes = acc.movements
        .filter(mov => mov > 0)
        .reduce((acc, mov) => acc + mov, 0);
    labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

    const outcomes = acc.movements
        .filter(mov => mov < 0)
        .reduce((acc, mov) => acc + mov, 0);
    labelSumOut.textContent = formatCur(Math.abs(outcomes), acc.locale, acc.currency);

    const interest = acc.movements
        .filter(mov => mov > 0)
        .map(deposit => deposit * acc.interestRate/100)
        .filter(int => int >= 1)
        .reduce((acc, int) => acc + int);
    labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);;
}

// create usernames
const createUsernames = accs => {
    accs.forEach(acc => {
        acc.username = acc.owner.toLowerCase().split(' ').map(name => name[0]).join('');
    }) 
    
}
createUsernames(accounts);

const updateUI = (acc) => {
    // display movements
    displayMovements(acc);

    // display balance
    calcDisplayBalance(acc);

    // display summary
    calcDisplaySummary(acc);
}

// EVENT HANDLERS
let currentAccount;

// // fake logged in
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;



btnLogin.addEventListener('click', e => {
    e.preventDefault();

    currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);
    
    if(currentAccount?.pin === +(inputLoginPin.value)) {
        // display message and UI
        labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
        containerApp.style.opacity = 100;

        // create current date and time
        const now = new Date();

        const options = {
            hour: 'numeric',
            minute: 'numeric',
            day: 'numeric',
            month: 'numeric', //long or 2-
            year: 'numeric',
        };
        // const locale = navigator.language;

        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);

        // clear input fields
        inputLoginUsername.value = inputLoginPin.value = ''
        inputLoginPin.blur();

        // update UI
        updateUI(currentAccount);
    }
})

btnTransfer.addEventListener('click', e => {
    e.preventDefault();

    const amount = +(inputTransferAmount.value);
    const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);

    if(amount > 0 && 
        receiverAcc &&
        currentAccount.balance >= amount &&
        receiverAcc?.username !== currentAccount.username
    ) {
        // doing the transfer
        currentAccount.movements.push(-amount);
        receiverAcc.movements.push(amount);

        // add transfer date
        currentAccount.movementsDates.push(new Date().toISOString());
        receiverAcc.movementsDates.push(new Date().toISOString());

        // clear input fields
        inputTransferAmount.value = inputTransferTo.value = '';
        inputTransferTo.blur();

        // update UI
        updateUI(currentAccount);
    }
})

btnLoan.addEventListener('click', e => {
    e.preventDefault();

    const amount = Math.floor(inputLoanAmount.value);

    if(amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)){
        currentAccount.movements.push(amount);

        // add loan date
        currentAccount.movementsDates.push(new Date().toISOString());

        updateUI(currentAccount);
    }

    inputLoanAmount.value = '';
})

let sorted = false;
btnSort.addEventListener('click', e => {
    e.preventDefault();

    displayMovements(currentAccount, !sorted);
    sorted = !sorted;
})

btnClose.addEventListener('click', e => {
    e.preventDefault();

    if(currentAccount.username === inputCloseUsername.value &&
        currentAccount.pin === +(inputClosePin.value)
    ){
        const index = accounts.findIndex(acc => acc.username === currentAccount.username);
        accounts.splice(index, 1);

        // clear input fields
        inputCloseUsername.value = inputClosePin.value = '';
        
        // hide UI and change message
        labelWelcome.textContent = 'Log in to get started';
        containerApp.style.opacity = 0;
    }
})
