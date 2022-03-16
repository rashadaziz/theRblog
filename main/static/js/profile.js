window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};
function main() {
  document.body.style.overflow = "hidden";

  const emphasis = document.getElementById("emphasis").cloneNode(true);
  emphasis.style.display = "inline-block";
  document.getElementById("emphasis").remove();
  document.body.insertBefore(emphasis, document.body.firstElementChild);

  setTimeout(() => {
    typeWriterAnimation(emphasis);
  }, 3000);
  setTimeout(() => {
    allowScrollDown();
  }, 6000); // change in production
}
function allowScrollDown() {
  document.querySelectorAll(".scroll-down h1").forEach((el) => {
    el.style.display = "block";
  });
  document.body.style.overflow = "scroll";
}

function typeWriterAnimation() {
  let word = "ashad";
  for (let i = 0; i <= word.length; i++) {
    setTimeout(() => {
      emphasis.innerText = "R" + word.substring(0, i) + "|";
    }, i * 100);
  }
  let flashCursor = null;
  setTimeout(() => {
    flashCursor = setInterval(() => {
      let lastChar = emphasis.innerText[emphasis.innerText.length - 1];
      if (lastChar !== "|") {
        emphasis.innerText += "|";
      } else {
        emphasis.innerText = emphasis.innerText.substring(
          0,
          emphasis.innerText.length - 1
        );
      }
    }, 350);
  }, 500);
}

main();
