// sua file data them vao
var checklogin = localStorage.getItem("checklogin");
if (checklogin === null){
  window.location.href="./login.html";
}

import text from "../json/data.json" assert { type: "json" };
const WIDTH_MOBILE = 660;
const configText = [
  {
    id: "punctution",
    icon: "fa-at",
    title: "Dấu câu",
  },
  {
    id: "numbers",
    icon: "fa-hashtag",
    title: "Chữ số",
  },
];
const configText1 = [
  {
    id: "time",
    icon: "fa-clock",
    title: "Thời gian",
    values: [15, 30, 60, 120],
  },
  {
    id: "language",
    icon: "fa-earth-asia",
    title: "Ngôn ngữ",
    values: ["Tiếng Việt", "English"],
  },
];
// moi them vao
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
// end
const app = class {
  constructor({ configText, configText1, text }) {
    let initValue = this.localStorage().get();
    if (!initValue) {
      this.localStorage().init();
      initValue = this.localStorage().get();
    }

    this.configText = configText;
    this.configText1 = configText1;
    this.punctution = initValue.punctution;
    this.numbers = initValue.numbers;
    this.configText1Current = initValue.configText1Current;
    this.time = initValue.time;
    this.language = initValue.language;
    this.text = text;
    this.currentText;
    this.currentIndexWord = 0;
    this.status = "ready";
    this.interval = 1;
    this.timeRemaining = this.time;
    this.wpm = 0;
  }
  localStorage(app) {
    return {
      init: function () {
        localStorage.setItem(
          "app",
          JSON.stringify({
            time: 15,
            language: "Tiếng Việt",
            punctution: false,
            numbers: false,
            configText1Current: {
              id: "time",
              icon: "fa-clock",
              title: "Thời gian",
              values: [15, 30, 60, 120],
            },
          })
        );
      },
      get: function () {
        return JSON.parse(localStorage.getItem("app"));
      },
      save: function () {
        localStorage.setItem(
          "app",
          JSON.stringify({
            time: app.time,
            language: app.language,
            punctution: app.punctution,
            numbers: app.numbers,
            configText1Current: app.configText1Current,
          })
        );
      },
    };
  }
  changeCurrentText(app) {
    let textOfLan = app.text[app.language === "Tiếng Việt" ? "vi" : "en"];
    // moi them vao
    let text = "";

    let id = Number.parseInt(urlParams.get("id"));
    if (id) {
      let textSearch = textOfLan.find((item) => item?.id === id);
      if (textSearch) {
        text = textSearch?.content;
      } else {
        text = textOfLan[Math.floor(textOfLan.length * Math.random())]?.content;
      }
    } else {
      text = textOfLan[Math.floor(textOfLan.length * Math.random())]?.content;
    }
    //end
    app.currentText = text;
    app.currentIndexWord = 0;
    app.renderText(app);
    return app.currentText;
  }
  render(app) {
    $(document).ready(function () {
      (function startWithResponsive() {
        if (window.innerWidth < WIDTH_MOBILE) {
          $("#nav").addClass("mobile");
          $("#logo").attr("src", "./images/logo_name_v2.png");
          $("#control").addClass("mobile");
        } else {
          $("#nav").removeClass("mobile");
          $("#logo").attr("src", "./images/logo_name_v1.png");
          $("#control").removeClass("mobile");
        }
      })();
      $("#config-text").html(
        app.configText.map((configTextItem) => {
          return `
          <div class="nav-part-item ${
            app[configTextItem.id] && "active"
          }" iditem="${configTextItem.id}">
            <i class="fa-solid ${configTextItem.icon}"></i>
            <span>${configTextItem.title}</span>
          </div>`;
        })
      );
      $("#config-text-2").html(
        app.configText1.map((configTextItem, index) => {
          return `
          <div class="nav-part-item ${
            app.configText1Current.id == configTextItem.id && "active"
          }" index="${index}">
            <i class="fa-solid ${configTextItem.icon}"></i>
            <span>${configTextItem.title}</span>
          </div>`;
        })
      );
      $("#optionals").html(
        app.configText1Current.values.map((value, index) => {
          return `<div class="nav-part-item ${
            (value == app.time || value == app.language) && "active"
          }" value="${value}">
            <span>${value}</span>
          </div>`;
        })
      );
      $("#time-num").text(app.timeRemaining);
    });
  }
  renderText(app) {
    let words = app.currentText;
    if (!app.punctution) {
      words = words.toLowerCase();
    }
    words = words.split(" ");
    words = words
      .map((word, index) => {
        let type = "normal";
        if (word.match(/[^A-Za-z0-9\u00C0-\u1EF9]/)) {
          type = "punctution";
        }
        if (word.match(/\d+/g)) {
          type = "numbers";
        }
        return {
          content: word,
          type: type,
        };
      })
      .filter((word) => {
        if (app.punctution && app.numbers) {
          return true;
        } else if (app.punctution) {
          if (["punctution", "normal"].includes(word.type)) {
            return true;
          }
        } else if (app.numbers) {
          if (["numbers", "normal"].includes(word.type)) {
            return true;
          }
        } else {
          if (word.type == "normal") {
            word.content = word.content.toLowerCase();
            return true;
          }
        }
        return false;
      });
    $(document).ready(function () {
      $("#text").html(
        words.map((word, index) => {
          return `<span id="word${index}" class="word">${word.content}</span>`;
        })
      );
      $("#word0").addClass("currentword");
      $("#word" + app.currentIndexWord)[0].scrollIntoView({
        behavior: "smooth",
      });
    });
  }
  renderSpecifications(app) {
    $(document).ready(() => {
      $("#wpm-num").text(app.wpm);
      $("#time-num").text(app.timeRemaining);
      if (app.status == "end") {
        $("#result").addClass("beat");
        $("#redo").addClass("fa-shake");
        $("#text").addClass("end");
        $("#restarttext").addClass("end");
      } else {
        $("#result").removeClass("bear");
        $("#redo").removeClass("fa-shake");
        $("#text").removeClass("end");
        $("#restarttext").removeClass("end");
      }
    });
  }
  updateStatusWord(app, status) {
    $(document).ready(() => {
      $("#word" + app.currentIndexWord)
        .removeClass(["currentword", "currentWordError"])
        .addClass(status);
      app.currentIndexWord++;
      $("#word" + app.currentIndexWord).addClass("currentword");
      $("#word" + app.currentIndexWord)[0].scrollIntoView({
        behavior: "smooth",
      });
    });
  }
  resetStatusTimeRemaining(app) {
    app.status = "ready";
    app.timeRemaining = app.time;
    $(document).ready(() => {
      $("#input")[0].value = "";
      $("#input")[0].focus();
    });
    app.renderSpecifications(app);
  }
  handleEvent(app) {
    $(document).ready(function () {
      $(window).resize(function (e) {
        if (e.target.innerWidth < WIDTH_MOBILE) {
          $("#nav").addClass("mobile");
          $("#logo").attr("src", "./images/logo_name_v2.png");
          $("#control").addClass("mobile");
        } else {
          $("#nav").removeClass("mobile");
          $("#logo").attr("src", "./images/logo_name_v1.png");
          $("#control").removeClass("mobile");
        }
      });
      $("#config-text .nav-part-item").click((e) => {
        let target = e.target.closest("#config-text .nav-part-item");
        if (target) {
          let config_text_id = target.getAttribute("iditem");
          app[config_text_id] = !app[config_text_id];
          app.render(app);
          app.handleEvent(app);
          app.changeCurrentText(app);
          app.resetStatusTimeRemaining(app);
          app.localStorage(app).save();
        }
      });
      $("#config-text-2 .nav-part-item").click((e) => {
        let target = e.target.closest("#config-text-2 .nav-part-item");
        let config_text2_index = target.getAttribute("index");
        app.configText1Current = app.configText1[config_text2_index];
        app.render(app);
        app.handleEvent(app);
        app.resetStatusTimeRemaining(app);
        app.localStorage(app).save();
      });
      $("#optionals .nav-part-item").click((e) => {
        let target = e.target.closest("#optionals .nav-part-item");
        app[app.configText1Current.id] = target.getAttribute("value");
        app.time *= 1;
        app.timeRemaining = app.time;
        app.render(app);
        app.handleEvent(app);
        app.changeCurrentText(app);
        app.resetStatusTimeRemaining(app);
        app.localStorage(app).save();
      });
      $("#redo").click((e) => {
        // moi them vao
        urlParams.delete("id");
        //end
        app.resetStatusTimeRemaining(app);
        app.renderSpecifications(app);
        app.changeCurrentText(app);
        $("#redo").addClass("fa-spin");
        setTimeout(() => {
          $("#redo").removeClass("fa-spin");
        }, 1000);
      });
      $("#wrappertext").click((e) => {
        if (e.target.closest(".end")) {
          $("#result").removeClass("beat");
          $("#redo").click();
        } else {
          $("#input").focus();
        }
      });
    });
  }
  handleInput(app) {
    $(document).ready(() => {
      $("#input").keyup(function (e) {
        let value = e.target.value.trim();
        let currentText = $("#word" + app.currentIndexWord)[0].innerText;
        switch (e.code) {
          case "Space": {
            if (value) {
              if (value == currentText) {
                app.updateStatusWord(app, "successword");
              } else {
                app.updateStatusWord(app, "errorword");
              }
            }
            e.target.value = "";
            break;
          }
          default: {
            function normalize(str) {
              return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            }
            if (normalize(currentText).startsWith(normalize(value))) {
              $("#word" + app.currentIndexWord).removeClass("currentWordError");
            } else {
              $("#word" + app.currentIndexWord).addClass("currentWordError");
            }
          }
        }
        if (["ready", "end"].includes(app.status)) {
          app.status = "running";
          app.updateSpecifications(app);
        }
      });
    });
  }
  updateSpecifications(app) {
    clearInterval(app.interval);
    app.interval = setInterval(() => {
      switch (app.status) {
        case "running": {
          if (app.timeRemaining <= 0) {
            app.status = "end";
            app.renderSpecifications(app);
            break;
          }
          app.timeRemaining--;
          app.wpm = Math.floor(
            ($(".successword").length / (app.time - app.timeRemaining)) * 60
          );
          app.renderSpecifications(app);
          break;
        }
      }
    }, 1000);
  }
  start() {
    this.changeCurrentText(this);
    this.render(this);
    this.handleEvent(this);
    this.handleInput(this);
    this.updateSpecifications(this);
  }
};
let APP = new app({ configText, configText1, text });
APP.start();
