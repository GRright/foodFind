"use strict";
const common_vendor = require("../common/vendor.js");
const FESTIVALS = [
  { month: 1, day: 1, name: "元旦", food: "新年第一餐，吃点好的！", icon: "🎉" },
  { month: 1, day: 15, name: "元宵节", food: "记得吃汤圆/元宵哦~", icon: "🏮" },
  { month: 2, day: 14, name: "情人节", food: "和TA一起吃顿浪漫的吧！", icon: "💕" },
  { month: 3, day: 8, name: "妇女节", food: "女神节，吃点甜的~", icon: "💐" },
  { month: 4, day: 1, name: "愚人节", food: "今天可以开个小玩笑~", icon: "🤪" },
  { month: 5, day: 1, name: "劳动节", food: "辛苦了，犒劳一下自己！", icon: "💪" },
  { month: 5, day: 12, name: "母亲节", food: "别忘了给妈妈做顿饭~", icon: "👩" },
  { month: 6, day: 1, name: "儿童节", food: "今天吃点童年回忆~", icon: "🎈" },
  { month: 6, day: 18, name: "父亲节", food: "给爸爸做顿好吃的！", icon: "👨" },
  { month: 8, day: 15, name: "中秋节", food: "记得吃月饼哦~", icon: "🥮" },
  { month: 10, day: 1, name: "国庆节", food: "假期好好享受美食！", icon: "🇨🇳" },
  { month: 12, day: 25, name: "圣诞节", food: "圣诞大餐安排起来~", icon: "🎄" }
];
function getTodayFestival() {
  const now = /* @__PURE__ */ new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return FESTIVALS.find((f) => f.month === month && f.day === day);
}
function getSpecialDates() {
  return common_vendor.index.getStorageSync("foodfind_special_dates") || [];
}
function saveSpecialDates(dates) {
  common_vendor.index.setStorageSync("foodfind_special_dates", dates);
}
function addSpecialDate(date) {
  const dates = getSpecialDates();
  const id = "sd_" + Date.now();
  dates.push({ id, ...date });
  saveSpecialDates(dates);
  return id;
}
function checkSpecialDateToday() {
  const now = /* @__PURE__ */ new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dates = getSpecialDates();
  return dates.find((d) => d.month === month && d.day === day);
}
function getBirthdayMenuRecommendation() {
  const special = checkSpecialDateToday();
  const festival = getTodayFestival();
  const event = special || festival;
  if (!event)
    return null;
  const isBirthday = event.type === "birthday";
  const isAnniversary = event.type === "anniversary";
  return {
    title: isBirthday ? "🎂 生日快乐！" : isAnniversary ? "💝 纪念日快乐！" : `${event.icon || "🎉"} ${event.name}`,
    subtitle: isBirthday ? "今天你是主角，来顿生日大餐吧！" : isAnniversary ? "一起吃顿好的庆祝一下吧！" : event.food || "今天是个特别的日子！",
    emoji: isBirthday ? "🎂" : isAnniversary ? "💝" : event.icon || "🎉",
    name: event.name || (isBirthday ? "生日" : "纪念日")
  };
}
exports.addSpecialDate = addSpecialDate;
exports.getBirthdayMenuRecommendation = getBirthdayMenuRecommendation;
