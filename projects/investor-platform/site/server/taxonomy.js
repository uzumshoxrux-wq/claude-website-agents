'use strict';
// Ro‘yxatlar: soha, hudud (14 birlik), bosqich, summa oraliqlari.
// Kalitlar ma’lumotlar bazasida va URL parametrlarida ishlatiladi.

const sectors = [
  ['qishloq', 'Qishloq xo‘jaligi'],
  ['oziq-ovqat', 'Oziq-ovqat ishlab chiqarish'],
  ['ishlab-chiqarish', 'Sanoat ishlab chiqarishi'],
  ['savdo', 'Savdo'],
  ['xizmatlar', 'Xizmatlar'],
  ['it', 'IT va texnologiya'],
  ['qurilish', 'Qurilish va materiallar'],
  ['turizm', 'Turizm va mehmondo‘stlik'],
  ['talim', 'Ta’lim'],
  ['soglik', 'Sog‘liqni saqlash'],
  ['logistika', 'Transport va logistika'],
  ['boshqa', 'Boshqa'],
];

const regions = [
  ['toshkent-sh', 'Toshkent shahri'],
  ['toshkent-v', 'Toshkent viloyati'],
  ['andijon', 'Andijon viloyati'],
  ['buxoro', 'Buxoro viloyati'],
  ['fargona', 'Farg‘ona viloyati'],
  ['jizzax', 'Jizzax viloyati'],
  ['xorazm', 'Xorazm viloyati'],
  ['namangan', 'Namangan viloyati'],
  ['navoiy', 'Navoiy viloyati'],
  ['qashqadaryo', 'Qashqadaryo viloyati'],
  ['samarqand', 'Samarqand viloyati'],
  ['sirdaryo', 'Sirdaryo viloyati'],
  ['surxondaryo', 'Surxondaryo viloyati'],
  ['qoraqalpogiston', 'Qoraqalpog‘iston Respublikasi'],
];

const stages = [
  ['goya', 'G‘oya'],
  ['boshlangich', 'Prototip / boshlang‘ich'],
  ['ishlayotgan', 'Ishlayotgan biznes'],
  ['kengaytirish', 'Kengaytirish'],
];

// [kalit, nom, min (shu jumladan), max (shu jumladan) | null]
const amounts = [
  ['a', '10 000 USD gacha', 0, 10000],
  ['b', '10 001 – 50 000 USD', 10001, 50000],
  ['c', '50 001 – 200 000 USD', 50001, 200000],
  ['d', '200 000 USD dan ortiq', 200001, null],
];

const sorts = [
  ['yangi', 'Avval yangilari'],
  ['summa-kamayish', 'Summa: kattadan kichikka'],
  ['summa-osish', 'Summa: kichikdan kattaga'],
  ['nom', 'Nomi bo‘yicha (A–Z)'],
];

const keys = (list) => new Set(list.map((x) => x[0]));

module.exports = {
  sectors, regions, stages, amounts, sorts,
  sectorKeys: keys(sectors),
  regionKeys: keys(regions),
  stageKeys: keys(stages),
  amountKeys: keys(amounts),
  sortKeys: keys(sorts),
  publicJSON() {
    return { sectors, regions, stages, amounts: amounts.map(([k, l]) => [k, l]), sorts };
  },
};
