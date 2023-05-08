const texts = [
  "Chuyến xe lửa đang chạy trên đường cao tốc, Johnny không cẩn thận làm rơi một chiếc giày mới mua ra ngoài cửa sổ, mọi người chung quanh đều cảm thấy tiếc cho ông. Bất ngờ, ông liền ném ngay chiếc giày thứ hai ra ngoài cửa sổ đó. Hành động này của Johnny khiến mọi người sửng sốt, thế là ông bèn từ tốn giải thích: “Chiếc giày này bất luận đắt đỏ như thế nào, đối với tôi mà nói nó đã không còn có ích gì nữa, nếu như có ai có thể nhặt được đôi giày, nói không chừng họ còn có thể mang vừa nó thì sao!”.",
  "Có một con gà nhỏ đang tìm cách phá vỏ trứng để chui ra, nó chần chừ e ngại thò đầu ra ngoài ngó nghiêng xem xét sự đời. Đúng lúc đó, 1 con rùa đi ngang qua, gánh trên mình chiếc mai nặng nề. Thấy thế, con gà nhỏ quyết định rời bỏ cái vỏ trứng ngay lập tức.",
  "Tiều phu cùng học giả đi chung một chiếc thuyền ở giữa sông. Học giả tự nhận mình hiểu biết sâu rộng nên đề nghị chơi trò đoán chữ cho đỡ nhàm chán, đồng thời giao kèo, nếu mình thua sẽ mất cho tiều phu mười đồng. Ngược lại, tiều phu thua sẽ chỉ mất năm đồng thôi. Học giả coi như mình nhường tiều phu để thể hiện trí tuệ hơn người. Đầu tiên, tiều phu ra câu đố: “Vật gì ở dưới sông nặng một ngàn cân, nhưng khi lên bờ chỉ còn có mười cân?”. Học giả vắt óc suy nghĩ vẫn tìm không ra câu trả lời, đành đưa cho tiều phu mười đồng. Sau đó, ông hỏi tiều phu câu trả lời là gì. “Tôi cũng không biết!“, tiều phu đưa lại cho học giả năm đồng và nói thêm: “Thật ngại quá, tôi kiếm được năm đồng rồi.” Học giả vô cùng sửng sốt.",
  "Một người đàn ông già sống trong ngôi làng nhỏ, cả làng cảm thấy phiền vì ông ta luôn phàn nàn, khiến cho mọi người xung quanh cảm thấy tâm trạng u ám. Càng ngày, ông ta càng khiến mọi người xung quanh khó chịu. Ông luôn khiến những người gặp mặt ông cảm thấy bất hạnh. Vì thế, tất cả người trong làng đều cố gắng hết sức để tránh đối mặt với ông ta. Nhưng một ngày nọ, khi ông già bước sang tuổi 80, mọi người ngạc nhiên bởi tin đồn: Hôm nay là một ngày hạnh phúc với ông già. Ông không phàn nàn bất cứ điều gì. Ông không hề nhăn nhó, thậm chí còn cười tươi rất nhiều",
  "Một đàn ếch đang di chuyển qua cánh rừng thì 2 con ếch không may bị rơi xuống hố sâu. Những con ếch khác cùng xem cái hố sâu đến chừng nào và kết luận rằng, hố quá sâu để có thể vượt ra ngoài. Chúng khuyên 2 con ếch kia rằng hãy giữ sức, vì chẳng có hy vọng gì đâu. Phớt lờ những lời nói đó, 2 con ếch bị rơi xuống hố vẫn nỗ lực tìm cách nhảy ra khỏi hố. Những con ếch trên miệng hố, không những không động viên mà còn khuyên chúng hãy từ bỏ đi.",
];
function getText() {
  let index = Math.floor(Math.random() * texts.length);
  let text = texts[index].toLocaleLowerCase();
  let textcp = text;
  for (let v of textcp) {
    let letterCharCodeAt = v.charCodeAt();
    let wordsRemove = [8220, 8221];
    let condition1 =
      (letterCharCodeAt > 32 && letterCharCodeAt < 48) ||
      (letterCharCodeAt > 90 && letterCharCodeAt < 97);
    let condition2 = wordsRemove.includes(letterCharCodeAt);
    if (condition1 || condition2) {
      text = text.replace(v, "");
    }
    switch (v) {
      case ":":
      case "?":
        text = text.replace(v, "");
    }
  }
  return text;
}
function getWords(text = getText()) {
  text = text.split(" ");
  text = text.map((word) => {
    return {
      word: word,
      status: 0,
      class: "word",
      letters: word.split(""),
    };
  });
  return text;
}
function getWordsHTML(words = getWords(), position = 0) {
  return words
    .map((word, index) => {
      return `<span class="word ${index == position && "current"} ${
        word.class
      }" ${index == position && 'id="current"'}>${word.word}</span>`;
    })
    .join("");
}
Array.prototype.checkWord = function (value, position) {
  if (value == this[position].word) {
    this[position].status = 1;
    this[position].class = "success";
  } else {
    this[position].status = -1;
    this[position].class = "error";
  }
};

export { getText, getWords, getWordsHTML };
