export interface WeeklyProgress {
  week: number;
  size: string;
  emoji: string;
  description: string;
}

export const BABY_PROGRESS_DATA: Record<number, WeeklyProgress> = {
  1: { week: 1, size: "Biji Selasih", emoji: "🌱", description: "Your pregnancy journey begins. Your body is preparing for ovulation and conception." },
  2: { week: 2, size: "Biji Selasih", emoji: "🌱", description: "Fertilization occurs. The fertilized egg starts dividing rapidly as it travels to the uterus." },
  3: { week: 3, size: "Biji Selasih", emoji: "🌱", description: "Implantation happens. The blastocyst attaches to the uterine wall, forming the foundation of the placenta." },
  4: { week: 4, size: "Biji Selasih", emoji: "🌱", description: "The embryo is the size of a poppy seed. The neural tube, which forms the brain and spine, is developing." },
  5: { week: 5, size: "Biji Epal", emoji: "🍎", description: "The heart begins to beat and simple blood vessels are forming. The embryo is growing fast." },
  6: { week: 6, size: "Kacang Pea", emoji: "🫛", description: "Facial features like eyes and nostrils are beginning to take shape. Tiny buds for arms and legs appear." },
  7: { week: 7, size: "Buah Blueberry", emoji: "🫐", description: "The brain is growing rapidly, generating about 100,000 new brain cells every minute!" },
  8: { week: 8, size: "Buah Rambutan", emoji: "🔴", description: "Hands and feet are forming tiny webbed fingers and toes. The baby is starting to move, though you can't feel it yet." },
  9: { week: 9, size: "Buah Zaitun", emoji: "🫒", description: "The tail has disappeared! The baby's heart has finished dividing into four chambers." },
  10: { week: 10, size: "Buah Ciku", emoji: "🥝", description: "All vital organs are formed and starting to function. Tiny fingernails and toenails are beginning to grow." },
  11: { week: 11, size: "Limau Nipis", emoji: "🍋", description: "The baby is active, stretching, and kicking, though still too small for you to feel. Hair follicles are forming." },
  12: { week: 12, size: "Buah Plum", emoji: "🍑", description: "Vocal cords are forming and reflexes are developing. The baby can open and close its mouth and fists." },
  13: { week: 13, size: "Buah Lemon", emoji: "🍋", description: "The second trimester starts! The baby is starting to produce urine and swallow amniotic fluid." },
  14: { week: 14, size: "Buah Lai", emoji: "🍐", description: "The baby's neck has lengthened and they can squint, frown, and grimace. Fine hair called lanugo covers the body." },
  15: { week: 15, size: "Buah Epal", emoji: "🍎", description: "The skeleton is starting to harden from cartilage into bone. The baby can now sense light through closed eyelids." },
  16: { week: 16, size: "Buah Avokado", emoji: "🥑", description: "The eyes have moved to their final position. You might start feeling tiny flutters (quickening) soon!" },
  17: { week: 17, size: "Buah Delima", emoji: "🍅", description: "The baby is developing a layer of fat under the skin for warmth. Their hearing is improving rapidly." },
  18: { week: 18, size: "Buah Naga (Dragon Fruit)", emoji: "🐉", description: "The baby can yawn, hiccup, and swallow. You will likely feel kicks and rolls more frequently now." },
  19: { week: 19, size: "Buah Mangga", emoji: "🥭", description: "A greasy white coating called vernix caseosa covers the skin to protect it from the amniotic fluid." },
  20: { week: 20, size: "Buah Pisang", emoji: "🍌", description: "Halfway there! The baby is active and sleep-wake cycles are becoming more defined." },
  21: { week: 21, size: "Lobak Merah", emoji: "🥕", description: "The digestive system is maturing. The baby's taste buds are developing, allowing them to taste the amniotic fluid." },
  22: { week: 22, size: "Buah Kelapa Muda", emoji: "🥥", description: "The baby's eyes are fully formed, though their irises don't have pigment yet. The brain continues to develop rapidly." },
  23: { week: 23, size: "Limau Bali", emoji: "🍊", description: "The baby's skin is wrinkled and reddish due to blood vessels showing through. They can hear external sounds clearly." },
  24: { week: 24, size: "Tembikai Susu", emoji: "🍈", description: "The lungs are starting to develop surfactant, a substance that helps the air sacs inflate after birth." },
  25: { week: 25, size: "Bunga Kubis", emoji: "🥦", description: "The baby is gaining baby fat and their skin is smoothing out. Their hands can now grip and hold." },
  26: { week: 26, size: "Daun Salad", emoji: "🥬", description: "The baby's eyes can now open and close. They may start to blink in response to bright lights outside the womb." },
  27: { week: 27, size: "Sengkuang", emoji: "🥔", description: "Your baby is starting to practice breathing movements, inhaling and exhaling amniotic fluid." },
  28: { week: 28, size: "Terung", emoji: "🍆", description: "The third trimester begins! The baby's brain can now control their body temperature and breathing." },
  29: { week: 29, size: "Labu", emoji: "🎃", description: "The baby's head is growing larger to accommodate their rapidly expanding brain. Kicks are getting stronger." },
  30: { week: 30, size: "Kubis", emoji: "🥬", description: "The baby is surrounded by about a pint and a half of amniotic fluid, which will decrease as they grow." },
  31: { week: 31, size: "Buah Nanas", emoji: "🍍", description: "The baby is going through a major growth spurt. All five senses are now fully functional." },
  32: { week: 32, size: "Buah Cempedak", emoji: "🍈", description: "The baby is starting to turn head-down in preparation for birth. Their toenails and fingernails are fully grown." },
  33: { week: 33, size: "Buah Durian", emoji: "🍈", description: "The baby's skull bones are still soft and flexible, which helps them pass through the birth canal." },
  34: { week: 34, size: "Tembikai Susu (Honeydew)", emoji: "🍈", description: "The baby's central nervous system and lungs are maturing. Their immune system is getting a boost from your antibodies." },
  35: { week: 35, size: "Buah Kelapa", emoji: "🥥", description: "The baby is putting on fat quickly, especially in the shoulders. Kicks may feel more like rolls and wiggles due to tight space." },
  36: { week: 36, size: "Buah Nangka", emoji: "🍈", description: "The baby is shedding their lanugo hair and vernix coating. They are now considered early term." },
  37: { week: 37, size: "Buah Kundur", emoji: "🍉", description: "Your pregnancy is now considered full term! The baby's organs are ready to function on their own." },
  38: { week: 38, size: "Labu Kuning", emoji: "🎃", description: "The baby is continuing to build fat layers to help regulate temperature after birth. Their grasp is very firm." },
  39: { week: 39, size: "Buah Tembikai", emoji: "🍉", description: "The baby is fully developed and ready to meet you! Their skin is smooth and plump." },
  40: { week: 40, size: "Buah Tembikai", emoji: "🍉", description: "Due date week! The baby is ready for birth. Most babies arrive within two weeks of their due date." },
  41: { week: 41, size: "Buah Tembikai", emoji: "🍉", description: "The baby is slightly overdue but perfectly safe. They are just continuing to grow a bit plumper." },
  42: { week: 42, size: "Buah Tembikai", emoji: "🍉", description: "Two weeks post-due. Your healthcare provider will likely discuss inducing labor soon." }
};

export const getBabyProgress = (week: number): WeeklyProgress => {
  const roundedWeek = Math.max(1, Math.min(42, Math.round(week)));
  return BABY_PROGRESS_DATA[roundedWeek];
};
