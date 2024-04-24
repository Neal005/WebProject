var checklogin = localStorage.getItem("checklogin");
if (checklogin === null){
  window.location.href="./login.html";
}

import text from "../json/data.json" assert { type: "json" };
//support function

const chunk = (array, size) =>
  array.reduce((acc, _, i) => {
    if (i % size === 0) acc.push(array.slice(i, i + size));
    return acc;
  }, []);
const unsignedString = (str) => {
  str = str?.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str?.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str?.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str?.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str?.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str?.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str?.replace(/đ/g, "d");
  str = str?.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str?.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str?.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str?.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str?.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str?.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str?.replace(/Đ/g, "D");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str?.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str?.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str?.replace(/ + /g, " ");
  str = str?.trim();
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str?.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    " "
  );
  str = str?.toLowerCase();
  return str;
};

// init
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

let btnLang = Array.from(document.querySelectorAll(".language"));

let page = Number.parseInt(urlParams.get("page")) || 1;
let lang = localStorage.getItem("lang");
if (!lang || !["vi", "en"].includes(lang)) {
  localStorage.setItem("lang", "vi");
  lang = "vi";
}
let dataJson = text[lang];

// set language

btnLang.forEach((item) => {
  item.addEventListener("click", (e) => {
    let btn = e.target;
    let languageBtn = btn?.getAttribute("data-lang");
    if (["vi", "en"].includes(languageBtn)) {
      dataJson = text[languageBtn];
      localStorage.setItem("lang", languageBtn);
      renderCard();
      paginate();
      showModal();
    }
  });
});

//filter data
let searchInput = document.querySelector("#search");
let titleSearch = urlParams.get("title") || "";

searchInput.setAttribute("value", titleSearch);

//computed data
const computed = (dataJson, offset = 3, titleSearch) => {
  //   filter
  let dataFilter = [];
  if (titleSearch) {
    dataFilter =
      dataJson?.length > 0 &&
      dataJson.filter((item) => {
        return unsignedString(item?.content).includes(
          unsignedString(titleSearch)
        );
      });
  } else {
    dataFilter = dataJson;
  }

  //chunk
  let arr = [];
  let dataChunked = chunk(dataFilter, offset);
  let count = 1;
  dataChunked?.length > 0 &&
    dataChunked.forEach((item) => {
      let obj = {};
      obj["page"] = count;
      obj["data"] = item;
      count++;
      arr.push(obj);
    });

  return arr?.length > 0 ? arr : [];
};

// render card
function renderCard() {
  let dataPaginated = computed(dataJson, 3, titleSearch) || [];
  let { data } =
    dataPaginated?.length > 0 &&
    dataPaginated.find((item) => item.page === page);
  let source = document.querySelector(".source");
  source.innerHTML = "";

  if (data?.length > 0) {
    data.map((item) => {
      let { id, content, title } = item;
      let card = `
      <div class="card border border-light mx-2 my-2" style="width: 18rem; min-height:22rem;background-color:inherit">
           <div class="card-body" >
               <h5 class="card-title">${title}</h5>
              <p class="card-text line-clamp">${content}</p>
              <button
              class="btn btn-success open-modal" data-bs-toggle="modal" data-bs-target="#modal" data-id="${id}"
              >
                  More
              </button>
              <a href="./index.html?id=${id}" class="btn btn-primary">Go to test</a>
           </div>
      </div>`;
      let div = document.createElement("div");
      div.classList.add("col-lg-4");
      div.classList.add("col-sm-12");
      div.innerHTML = card;
      source.appendChild(div);
    });
  } else {
    let div = document.createElement("div");
    div.innerHTML = `
    <div class="error">
    	<div class="fof">
        		<h1>Error 404</h1>
    	</div>
    </div>
  `;
    source.appendChild(div);
  }
}

//paginate
function paginate() {
  let dataPaginated = computed(dataJson, 3, titleSearch) || [];
  let ulPaginate = document.querySelector("#pagination");

  ulPaginate.innerHTML = "";
  if (dataPaginated?.length > 0) {
    if (page > 1) {
      let li = document.createElement("li");
      li.classList.add("page-item");

      li.innerHTML = `<a class="page-link" href="./source.html?page=${
        page - 1
      }">Previous</a>`;
      ulPaginate.append(li);
    } else {
      let li = document.createElement("li");
      li.classList.add("page-item");
      li.classList.add("disabled");
      li.innerHTML = `<a class="page-link" href="./source.html?page=${page}">Previous</a>`;
      ulPaginate.append(li);
    }
    dataPaginated?.length > 0 &&
      dataPaginated.forEach((item) => {
        let li = document.createElement("li");
        li.classList.add("page-item");
        if (page === item.page) {
          li.classList.add("active");
        }
        li.innerHTML = `<a class="page-link" href="./source.html?page=${item.page}">${item.page}</a>`;
        ulPaginate.appendChild(li);
      });
    if (page < dataPaginated?.length) {
      let li = document.createElement("li");
      li.classList.add("page-item");

      li.innerHTML = `<a class="page-link" href="./source.html?page=${
        page + 1
      }">Next</a>`;
      ulPaginate.append(li);
    } else {
      let li = document.createElement("li");
      li.classList.add("page-item");
      li.classList.add("disabled");
      li.innerHTML = `<a class="page-link" href="./source.html?page=${page}">Next</a>`;
      ulPaginate.append(li);
    }
  }
}

// show modal text
function showModal() {
  let dataPaginated = computed(dataJson, 3, titleSearch) || [];
  let { data } =
    dataPaginated?.length > 0 &&
    dataPaginated.find((item) => item.page === page);
  let buttonsModal = document.querySelectorAll(".open-modal");
  let modalTitle = document.querySelector(".modal-title");
  let modalBody = document.querySelector(".modal-body");
  buttonsModal?.length > 0 &&
    buttonsModal.forEach((item) => {
      item.addEventListener("click", (e) => {
        let id = Number.parseInt(e.target.getAttribute("data-id"));
        let obj = data?.length > 0 && data.find((item) => item.id === id);
        if (obj) {
          modalTitle.innerHTML = obj?.title;
          modalBody.innerHTML = obj?.content;
        }
      });
    });
}
renderCard();
paginate();
showModal();
