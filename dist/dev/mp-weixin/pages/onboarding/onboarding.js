"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      questions: [
        { id: 1, question: "你属于哪类人群？", type: "single_choice", options: [
          { label: "成人", value: "adult" },
          { label: "儿童", value: "child" },
          { label: "老年人", value: "elderly" },
          { label: "孕妇", value: "pregnant" },
          { label: "健身人群", value: "fitness" },
          { label: "高血脂/高血压", value: "health_care" }
        ] },
        { id: 2, question: "你喜欢什么口味？", type: "multi_choice", options: [
          { label: "清淡", value: "light" },
          { label: "麻辣", value: "spicy" },
          { label: "酸甜", value: "sweet_sour" },
          { label: "咸鲜", value: "salty" },
          { label: "香辣", value: "hot" },
          { label: "原味", value: "original" }
        ] },
        { id: 3, question: "每餐大概吃几个菜？", type: "single_choice", options: [
          { label: "1-2个菜", value: "1-2" },
          { label: "3-4个菜", value: "3-4" },
          { label: "5-6个菜", value: "5-6" },
          { label: "7个菜以上", value: "7+" }
        ] }
      ],
      currentStep: 0,
      selectedAnswer: "",
      selectedAnswers: [],
      answers: [],
      questionHeight: "calc(100vh - 320rpx)"
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
      this.answers[this.currentStep] = { question_id: q.id, value: val };
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
      common_vendor.index.showLoading({ title: "保存中..." });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "设置完成", icon: "success" });
        setTimeout(() => {
          common_vendor.index.switchTab({ url: "/pages/index/index" });
        }, 1500);
      }, 800);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.progress + "%",
    b: common_vendor.t($data.currentStep + 1),
    c: common_vendor.t($options.totalSteps),
    d: $options.currentQuestion
  }, $options.currentQuestion ? common_vendor.e({
    e: common_vendor.t($options.currentQuestion.question),
    f: $options.currentQuestion.type === "single_choice"
  }, $options.currentQuestion.type === "single_choice" ? {
    g: common_vendor.f($options.currentQuestion.options, (opt, k0, i0) => {
      return common_vendor.e({
        a: $data.selectedAnswer === opt.value
      }, $data.selectedAnswer === opt.value ? {} : {}, {
        b: common_vendor.t(opt.label),
        c: $data.selectedAnswer === opt.value ? 1 : "",
        d: opt.value,
        e: common_vendor.o(($event) => $options.selectSingle(opt.value), opt.value)
      });
    })
  } : {
    h: common_vendor.f($options.currentQuestion.options, (opt, k0, i0) => {
      return common_vendor.e({
        a: $options.isSelected(opt.value)
      }, $options.isSelected(opt.value) ? {} : {}, {
        b: common_vendor.t(opt.label),
        c: $options.isSelected(opt.value) ? 1 : "",
        d: opt.value,
        e: common_vendor.o(($event) => $options.toggleMulti(opt.value), opt.value)
      });
    })
  }) : {}, {
    i: $data.currentStep > 0
  }, $data.currentStep > 0 ? {
    j: common_vendor.o((...args) => $options.prevStep && $options.prevStep(...args))
  } : {}, {
    k: common_vendor.t($options.isLast ? "完成" : "下一步"),
    l: !$options.canProceed ? 1 : "",
    m: common_vendor.o((...args) => $options.handleNext && $options.handleNext(...args)),
    n: $data.questionHeight
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6a71c977"]]);
wx.createPage(MiniProgramPage);
