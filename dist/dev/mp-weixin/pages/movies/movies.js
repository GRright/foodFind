"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      movieTypes: [
        { label: "全部", value: "" },
        { label: "电影", value: "电影" },
        { label: "纪录片", value: "纪录片" },
        { label: "短剧", value: "短剧" },
        { label: "综艺", value: "综艺" }
      ],
      movies: [
        { id: 1, title: "阿甘正传", genre: "电影", year: 1994, rating: 9.5, platform: "腾讯视频", icon: "🎬" },
        { id: 2, title: "肖申克的救赎", genre: "电影", year: 1994, rating: 9.7, platform: "爱奇艺", icon: "🎥" },
        { id: 3, title: "盗梦空间", genre: "电影", year: 2010, rating: 9.3, platform: "优酷", icon: "🍿" },
        { id: 4, title: "人生一串", genre: "纪录片", year: 2018, rating: 9, platform: "哔哩哔哩", icon: "📺" },
        { id: 5, title: "风味人间", genre: "纪录片", year: 2018, rating: 9.1, platform: "腾讯视频", icon: "🎞️" },
        { id: 6, title: "隐秘的角落", genre: "短剧", year: 2020, rating: 8.8, platform: "爱奇艺", icon: "🎭" },
        { id: 7, title: "沉默的真相", genre: "短剧", year: 2020, rating: 9.2, platform: "爱奇艺", icon: "🎬" },
        { id: 8, title: "舌尖上的中国", genre: "纪录片", year: 2012, rating: 9.3, platform: "央视", icon: "🍜" }
      ],
      currentTypeIndex: 0,
      movieScrollHeight: "calc(100vh - 100rpx)"
    };
  },
  computed: {
    filteredMovies() {
      const type = this.movieTypes[this.currentTypeIndex].value;
      return type ? this.movies.filter((m) => m.genre === type) : this.movies;
    }
  },
  methods: {
    switchType(index) {
      this.currentTypeIndex = index;
    },
    viewMovie(movie) {
      common_vendor.index.showToast({ title: `即将跳转到${movie.platform}`, icon: "none" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.movieTypes, (type, index, i0) => {
      return {
        a: common_vendor.t(type.label),
        b: $data.currentTypeIndex === index ? 1 : "",
        c: type.value,
        d: common_vendor.o(($event) => $options.switchType(index), type.value)
      };
    }),
    b: common_vendor.f($options.filteredMovies, (movie, k0, i0) => {
      return {
        a: common_vendor.t(movie.icon),
        b: common_vendor.t(movie.rating),
        c: common_vendor.t(movie.title),
        d: common_vendor.t(movie.genre),
        e: common_vendor.t(movie.year),
        f: common_vendor.t(movie.platform),
        g: movie.id,
        h: common_vendor.o(($event) => $options.viewMovie(movie), movie.id)
      };
    }),
    c: $data.movieScrollHeight
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7999d0fe"]]);
wx.createPage(MiniProgramPage);
