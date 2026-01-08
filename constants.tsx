
import { Trainer, Membership, Product, Language, Review } from './types';

export const DEFAULT_PROFILE_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg";

export const getTrainers = (lang: Language): Trainer[] => {
  const isBg = lang === 'bg';
  return [
    {
      id: '1',
      name: isBg ? 'Иван Петров' : 'Ivan Petrov',
      specialty: isBg ? 'Силови тренировки' : 'Strength Training',
      price: 15,
      image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=400&auto=format&fit=crop',
      phone: '+359 88 123 4567',
      bio: isBg 
        ? 'С над 10 години опит в бодибилдинга, Иван специализира в изграждане на мускулна маса и силова издръжливост.'
        : 'With over 10 years of bodybuilding experience, Ivan specializes in muscle hypertrophy and strength endurance.',
      availability: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'],
      languages: ['Bulgarian', 'English']
    },
    {
      id: '2',
      name: isBg ? 'Мария Иванова' : 'Maria Ivanova',
      specialty: isBg ? 'Йога и Пилатес' : 'Yoga & Pilates',
      price: 15,
      image: 'https://images.unsplash.com/photo-1518611012118-296072bb5fe9?q=80&w=400&auto=format&fit=crop',
      phone: '+359 88 234 5678',
      bio: isBg
        ? 'Мария помага на клиентите да намерят баланс между тялото и ума чрез йога.'
        : 'Maria helps clients find balance between body and mind through yoga.',
      availability: ['07:00', '11:00', '12:00', '17:00', '18:00'],
      languages: ['Bulgarian', 'English', 'Russian']
    },
    {
      id: '3',
      name: isBg ? 'Елена Костова' : 'Elena Kostova',
      specialty: isBg ? 'Кросфит' : 'Crossfit',
      price: 15,
      image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=400&auto=format&fit=crop',
      phone: '+359 88 345 6789',
      bio: isBg
        ? 'Бивш състезател по лека атлетика, Елена води високоинтензивни тренировки.'
        : 'A former track and field athlete, Elena leads high-intensity workouts.',
      availability: ['09:00', '10:00', '11:00', '15:00', '19:00'],
      languages: ['Bulgarian', 'English']
    }
  ];
};

export const getMemberships = (lang: Language): Membership[] => {
  const isBg = lang === 'bg';
  return [
    {
      id: 'single',
      name: isBg ? 'Еднократна тренировка' : 'Single Visit',
      price: '7.00',
      unit: isBg ? 'ПОСЕЩЕНИЕ' : 'VISIT',
      features: isBg 
        ? ['Достъп до цялото оборудване', 'Ползване на шкафче'] 
        : ['Access to all equipment', 'Locker access'],
    },
    {
      id: 'unlimited_women',
      name: isBg ? 'Карта Жени (30 дни)' : 'Women Unlimited (30d)',
      price: '70.00',
      unit: isBg ? 'МЕСЕЦ' : 'MONTH',
      features: isBg 
        ? ['Неограничени посещения', 'Професионално оборудване'] 
        : ['Unlimited visits', 'Professional equipment'],
    },
    {
      id: 'unlimited_men',
      name: isBg ? 'Карта Мъже (30 дни)' : 'Men Unlimited (30d)',
      price: '90.00',
      unit: isBg ? 'МЕСЕЦ' : 'MONTH',
      features: isBg 
        ? ['Неограничени посещения', 'Професионално оборудване'] 
        : ['Unlimited visits', 'Professional equipment'],
      isPopular: true
    }
  ];
};

export const getProducts = (lang: Language): Product[] => {
  const isBg = lang === 'bg';
  return [
    { id: 'p1', name: 'ON Gold Standard Whey', price: 135.00, category: isBg ? 'Добавки' : 'Supplements', image: 'https://content.optimumnutrition.com/i/on/on-gold-standard-100-whey_Image_01?locale=en-us,en-gb,*&layer0=$MAIN$', description: 'Whey Protein' },
  ];
};

export const getReviews = (lang: Language): Review[] => {
  const isBg = lang === 'bg';
  return [
    { id: 'r1', author: isBg ? 'Георги Димитров' : 'Georgi Dimitrov', rating: 5, text: isBg ? 'Най-добрата зала във Варна!' : 'Best gym in Varna!', time: isBg ? 'преди 2 седмици' : '2 weeks ago', avatar: 'G' },
  ];
};

export const getTrainerReviews = (trainerId: string, lang: Language): Review[] => {
  const isBg = lang === 'bg';
  return [
    { id: `tr1-${trainerId}`, trainerId, author: 'Alex', rating: 5, text: isBg ? 'Супер професионалист!' : 'Great professional!', time: '3d ago', avatar: 'A' }
  ];
};

export const TRANSLATIONS = {
  bg: {
    home: 'Начало',
    about: 'За нас',
    booking: 'Резервация',
    memberships: 'Карти',
    shop: 'Магазин',
    admin: 'Web Admin',
    contact: 'Контакти',
    login: 'Вход',
    register: 'Регистрация',
    logout: 'Изход',
    myBookings: 'Моите часове',
    location: 'Локация',
    address: 'ул. „Студентска“ 1А, Варна',
    stop: '9010 Варна',
    gymDesc: 'Професионална фитнес база във Варна. Дисциплина и резултати.',
    gymPhone: '+359 88 343 0184',
    bookNow: 'Запиши час',
    joinMovement: 'Стани част от ClassFit',
    transform: 'ТРАНСФОРМИРАЙ',
    yourself: 'СЕБЕ СИ',
    motivation: 'Вашият път към съвършенството започва тук.',
    locationVarna: 'Локация Варна',
    locationDesc: 'Намираме се на ул. Студентска 1А, Варна.',
    pushBoundaries: 'ПРЕМИНЕТЕ ГРАНИЦИТЕ СИ',
    pushDesc: 'Всяка тренировка е инвестиция в бъдещото ти аз.',
    readyLevel: 'ГОТОВИ ЛИ СТЕ ЗА СЛЕДВАЩОТО НИВО?',
    joinClassfit: 'ЕЛА В CLASSFIT',
    features: ['Топ Оборудване', 'Лични Треньори', 'Добавки', 'Общност'],
    reviewsTitle: 'Отзиви',
    reviewsSubtitle: 'Какво казват нашите членове',
    viewOnGoogle: 'Виж в Google Maps',
    googleRating: 'Google Рейтинг',
    basedOn: 'Базирано на 120+ отзива',
    selectTrainer: 'Избери треньор',
    trainer: 'Инструктор',
    perSession: 'лв / тренировка',
    availableSlots: 'Свободни часове',
    finalize: 'Финализиране',
    reqSent: 'Заявката е изпратена!',
    waitingConfirmation: 'Очаква се потвърждение от треньора',
    trainerPhoneLabel: 'Телефон на треньора',
    newBooking: 'Нова резервация',
    confirmBooking: 'Потвърди резервация',
    yourExperience: 'Твоето преживяване',
    submitFeedback: 'Изпрати отзив',
    profileSettings: 'Настройки на профила',
    leaveReview: 'Остави отзив',
    noBookings: 'Нямате часове.',
    makeFirst: 'Запишете първия си час',
    sure: 'Сигурни ли сте?',
    deleteBooking: 'Изтрий резервация',
    accessDenied: 'Нямате достъп.',
    payAtDesk: 'Плащане на рецепция',
    mostPopular: 'Най-популярна',
    learnMore: 'Научи повече',
    choosePower: 'Изберете вашата карта.',
    store: 'Classfit Магазин',
    premiumProducts: 'Премиум продукти за най-добрите.',
    catAll: 'Всички',
    catPrograms: 'Програми',
    catSupplements: 'Добавки',
    catGear: 'Екипировка',
    ableToPayAtDesk: 'Плащане на място',
    trainerReviewMsg: 'Заявката е изпратена! Моля, изчакайте треньорът да я потвърди.',
    email: 'Имейл',
    password: 'Парола',
    welcomeBack: 'Добре дошли в ClassFit',
    loginBtn: 'Влез',
    noAccount: 'Нямате акаунт?',
    registerHere: 'Регистрация тук',
    trainerRegistration: 'Регистрация за треньори',
    invalidCreds: 'Грешен имейл или парола.',
    yesAccount: 'Имате акаунт?',
    loginHere: 'Влез тук',
    startTrans: 'Започнете днес',
    emailTaken: 'Имейлът е зает.',
    createAccount: 'Регистрация',
    connect: 'Свържи се',
    workingHours: 'Работно време',
    monFri: 'Пон - Пет',
    satSun: 'Съб - Нед',
    applicationFiled: 'Заявката е приета',
    pendingReviewMsg: 'Вашият профил ще бъде прегледан от екипа ни.',
    returnToBase: 'Към началната страница',
    joinThe: 'Стани част от',
    eliteTeam: 'Елитния екип',
    varnaProfessionals: 'Търсим най-добрите професионалисти във Варна.',
    coachPortal: 'Портал за треньори',
    professionalDetails: 'Професионални детайли',
    coachPhilosophy: 'Разкажете ни за вашата експертиза.',
    deleteMsg: 'Изтрий',
    statusCompleted: 'Платен',
    statusTrainerCompleted: 'За плащане'
  },
  en: {
    home: 'Home',
    about: 'About',
    booking: 'Booking',
    memberships: 'Memberships',
    shop: 'Shop',
    admin: 'Web Admin',
    contact: 'Contact',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    myBookings: 'My Sessions',
    location: 'Location',
    address: '1A Studentska St., Varna',
    stop: '9010 Varna',
    gymDesc: 'Professional fitness in Varna. Discipline & Results.',
    gymPhone: '+359 88 343 0184',
    bookNow: 'Book Session',
    joinMovement: 'Join ClassFit',
    transform: 'TRANSFORM',
    yourself: 'YOURSELF',
    motivation: 'Your path to perfection starts here.',
    locationVarna: 'Varna Location',
    locationDesc: 'Located at 1A Studentska St., Varna.',
    pushBoundaries: 'PUSH YOUR BOUNDARIES',
    pushDesc: 'Every workout is an investment in your future self.',
    readyLevel: 'READY FOR THE NEXT LEVEL?',
    joinClassfit: 'JOIN CLASSFIT',
    features: ['Pro Equipment', 'Personal Trainers', 'Supplements', 'Community'],
    reviewsTitle: 'Reviews',
    reviewsSubtitle: 'What our members say',
    viewOnGoogle: 'GET DIRECTIONS',
    googleRating: 'Google Rating',
    basedOn: '120+ reviews',
    selectTrainer: 'Select Trainer',
    trainer: 'Gym Coach',
    perSession: 'lv / session',
    availableSlots: 'Available slots',
    finalize: 'Finalize',
    reqSent: 'Request Sent!',
    waitingConfirmation: 'Waiting for coach to confirm',
    trainerPhoneLabel: "Coach's Phone",
    newBooking: 'New Booking',
    confirmBooking: 'Confirm Booking',
    yourExperience: 'Your Experience',
    submitFeedback: 'Submit Feedback',
    profileSettings: 'Profile Settings',
    leaveReview: 'Leave a Review',
    noBookings: 'No active sessions.',
    makeFirst: 'Book your first session',
    sure: 'Are you sure?',
    deleteBooking: 'Delete Booking',
    accessDenied: 'Access Denied.',
    payAtDesk: 'Pay at Desk',
    mostPopular: 'Most Popular',
    learnMore: 'Learn More',
    choosePower: 'Choose your card.',
    store: 'Classfit Store',
    premiumProducts: 'Premium products for the best.',
    catAll: 'All',
    catPrograms: 'Programs',
    catSupplements: 'Supplements',
    catGear: 'Gear',
    ableToPayAtDesk: 'Pay at gym',
    trainerReviewMsg: 'Request sent! Waiting for coach to confirm.',
    email: 'Email',
    password: 'Password',
    welcomeBack: 'Welcome to ClassFit',
    loginBtn: 'Login',
    noAccount: 'No account?',
    registerHere: 'Register here',
    trainerRegistration: 'Coach Registration',
    invalidCreds: 'Invalid email or password.',
    yesAccount: 'Have an account?',
    loginHere: 'Login here',
    startTrans: 'Start today',
    emailTaken: 'Email already taken.',
    createAccount: 'Sign Up',
    connect: 'Connect',
    workingHours: 'Working Hours',
    monFri: 'Mon - Fri',
    satSun: 'Sat - Sun',
    applicationFiled: 'Application Filed',
    pendingReviewMsg: 'Your profile will be reviewed by our team.',
    returnToBase: 'Return to Base',
    joinThe: 'Join the',
    eliteTeam: 'Elite Team',
    varnaProfessionals: 'We are looking for the best professionals in Varna.',
    coachPortal: 'Coach Portal',
    professionalDetails: 'Professional Details',
    coachPhilosophy: 'Tell us about your expertise.',
    deleteMsg: 'Delete',
    statusCompleted: 'Paid',
    statusTrainerCompleted: 'Awaiting Payment'
  }
};
