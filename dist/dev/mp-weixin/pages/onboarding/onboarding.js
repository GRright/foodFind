"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      questions: [
        { id: 1, question: "你属于哪类人群？", type: "single_choice", options: [
          { label: "🧑 成人（普通）", value: "adult" },
          { label: "💪 健身人群", value: "fitness" },
          { label: "🤰 孕妇/哺乳期", value: "pregnant" },
          { label: "👴 老年人", value: "elderly" },
          { label: "👶 婴幼儿家庭", value: "child" },
          { label: "🏥 慢性病管理", value: "health_care" }
        ] },
        { id: 2, question: "你喜欢什么口味？", type: "single_choice", options: [
          { label: "🍃 清淡养生", value: "light" },
          { label: "🌶️ 麻辣过瘾", value: "spicy" },
          { label: "🍯 酸甜开胃", value: "sweet_sour" },
          { label: "🧂 咸鲜下饭", value: "salty" },
          { label: "🔥 香辣重口", value: "hot" },
          { label: "🍚 原汁原味", value: "original" }
        ] },
        { id: 3, question: "平时一般几人用餐？", type: "single_choice", options: [
          { label: "🥢 1人食", value: "1" },
          { label: "🍽️ 2人份（情侣/夫妻）", value: "2" },
          { label: "👨‍👩‍👧 3-4人小家庭", value: "3-4" },
          { label: "🏠 5人以上大家庭", value: "5+" }
        ] },
        { id: 4, question: "你偏好哪些菜系？（可多选）", type: "multi_choice", options: [
          { label: "🏠 家常菜", value: "home_cooking" },
          { label: "🌶️ 川菜/湘菜", value: "sichuan" },
          { label: "🦆 粤菜/广式", value: "cantonese" },
          { label: "🍜 北方菜/面食", value: "northern" },
          { label: "🥗 轻食/减脂餐", value: "healthy" },
          { label: "🍜 日韩料理", value: "asian_fusion" }
        ] }
      ],
      currentStep: 0,
      selectedAnswer: "",
      selectedAnswers: [],
      answers: [],
      questionHeight: "calc(100vh - 340rpx)"
    };
  },
  computed: {
    totalSteps() {
      return this.questions.length;
    },
    currentQuestion() {
      return this.questions[this.currentStep];
    },
    isLast() {
      return this.currentStep === this.totalSteps - 1;
    },
    progress() {
      return Math.round((this.currentStep + 1) / this.totalSteps * 100);
    },
    canProceed() {
      if (!this.currentQuestion)
        return false;
      if (this.currentQuestion.type === "single_choice")
        return !!this.selectedAnswer;
      return this.selectedAnswers.length > 0;
    }
  },
  methods: {
    isSelected(val) {
      return this.selectedAnswers.includes(val);
    },
    selectSingle(val) {
      this.selectedAnswer = val;
      setTimeout(() => {
        if (this.isLast) {
          this.submit();
        } else {
          this.nextStep();
        }
      }, 280);
    },
    toggleMulti(val) {
      let list = [...this.selectedAnswers];
      const idx = list.indexOf(val);
      idx > -1 ? list.splice(idx, 1) : list.push(val);
      this.selectedAnswers = list;
    },
    saveCurrent() {
      const q = this.currentQuestion;
      const val = q.type === "single_choice" ? this.selectedAnswer : [...this.selectedAnswers];
      this.answers[this.currentStep] = { question_id: q.id, question: q.question, value: val };
    },
    nextStep() {
      this.saveCurrent();
      if (this.currentStep < this.totalSteps - 1) {
        this.currentStep++;
        this.selectedAnswer = "";
        this.selectedAnswers = [];
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
        const prev = this.answers[this.currentStep];
        if (prev) {
          this.currentQuestion.type === "single_choice" ? this.selectedAnswer = prev.value : this.selectedAnswers = prev.value;
        }
      }
    },
    handleNext() {
      if (!this.canProceed)
        return;
      if (this.isLast) {
        this.submit();
      } else {
        this.nextStep();
      }
    },
    submit() {
      this.saveCurrent();
      common_vendor.index.setStorageSync("foodfind_preferences", this.answers);
      const userCountMap = { "1": 1, "2": 2, "3-4": 3, "5+": 5 };
      const userCountAns = this.answers.find((a) => a.question_id === 3);
      if (userCountAns) {
        common_vendor.index.setStorageSync("foodfind_user_count", userCountMap[userCountAns.value] || 2);
      }
      common_vendor.index.showToast({ title: "设置完成，开始美食之旅！", icon: "success", duration: 1500 });
      setTimeout(() => {
        common_vendor.index.reLaunch({ url: "/pages/index/index" });
      }, 1500);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.progress + "%",
    b: common_vendor.f($data.questions, (q, i, i0) => {
      return {
        a: i < $data.currentStep ? 1 : "",
        b: i === $data.currentStep ? 1 : "",
        c: i
      };
    }),
    c: common_vendor.t($data.currentStep + 1),
    d: common_vendor.t($options.totalSteps),
    e: $options.currentQuestion
  }, $options.currentQuestion ? common_vendor.e({
    f: common_vendor.t($options.currentQuestion.question),
    g: $options.currentQuestion.type === "single_choice"
  }, $options.currentQuestion.type === "single_choice" ? {
    h: common_vendor.f($options.currentQuestion.options, (opt, oi, i0) => {
      return common_vendor.e({
        a: $data.selectedAnswer === opt.value
      }, $data.selectedAnswer === opt.value ? {} : {}, {
        b: common_vendor.t(opt.label),
        c: $data.selectedAnswer === opt.value
      }, $data.selectedAnswer === opt.value ? {} : {}, {
        d: $data.selectedAnswer === opt.value ? 1 : "",
        e: opt.value,
        f: common_vendor.o(($event) => $options.selectSingle(opt.value), opt.value)
      });
    })
  } : {
    i: common_vendor.f($options.currentQuestion.options, (opt, oi, i0) => {
      return common_vendor.e({
        a: $options.isSelected(opt.value)
      }, $options.isSelected(opt.value) ? {} : {}, {
        b: common_vendor.t(opt.label),
        c: $options.isSelected(opt.value) ? 1 : "",
        d: opt.value,
        e: common_vendor.o(($event) => $options.toggleMulti(opt.value), opt.value)
      });
    })
  }, {
    j: $data.currentStep
  }) : {}, {
    k: $data.currentStep > 0
  }, $data.currentStep > 0 ? {
    l: common_vendor.o((...args) => $options.prevStep && $options.prevStep(...args))
  } : {}, {
    m: $options.currentQuestion && $options.currentQuestion.type !== "single_choice"
  }, $options.currentQuestion && $options.currentQuestion.type !== "single_choice" ? {
    n: common_vendor.t($options.isLast ? "完成设置 ✓" : "下一步 ▶"),
    o: !$options.canProceed ? 1 : "",
    p: common_vendor.o((...args) => $options.handleNext && $options.handleNext(...args))
  } : {}, {
    q: $options.currentQuestion && $options.currentQuestion.type === "single_choice" && !$data.selectedAnswer
  }, $options.currentQuestion && $options.currentQuestion.type === "single_choice" && !$data.selectedAnswer ? {} : {}, {
    r: $data.questionHeight
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6a71c977"]]);
wx.createPage(MiniProgramPage);
