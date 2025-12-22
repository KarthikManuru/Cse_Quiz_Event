// Each set contains 20 questions
// correctIndex = 0 / 1 / 2 / 3 (based on ✓ answers)

const baseQuestions = [
  {
    id: 1,
    question:
      "Q1: HTML Semantics Mystery\n\n" +
      "<article>\n" +
      "  <header>Welcome</header>\n" +
      "  <section>Content here</section>\n" +
      "  <footer>© 2024</footer>\n" +
      "</article>\n\n" +
      "What happens if you nest another <header> inside the <section>?",
    options: [
      "Syntax error",
      "It's perfectly valid",
      "Only works in Chrome",
      "Automatically converts to <div>"
    ],
    correctIndex: 1
  },
  {
    id: 2,
    question:
      "Q2: CSS Specificity Battle\n\n" +
      "Which selector has the HIGHEST specificity?",
    options: [
      "div.container p",
      "#main .content p",
      "[data-type=\"special\"] p",
      ".container #main p"
    ],
    correctIndex: 3
  },
  {
    id: 3,
    question:
      "Q3: JavaScript Scope Surprise\n\n" +
      "let x = 1;\n" +
      "{\n" +
      "  let x = 2;\n" +
      "  console.log(x);\n" +
      "}\n" +
      "console.log(x);\n\n" +
      "What gets logged?",
    options: ["2, 2", "1, 1", "2, 1", "undefined, 1"],
    correctIndex: 2
  },
  {
    id: 4,
    question:
      "Q4: Flexbox Fun\n\n" +
      "If justify-content: space-between is applied to a flex container with 3 items, where does the extra space go?",
    options: [
      "Before first item",
      "After last item",
      "Between items only",
      "Equally around all items"
    ],
    correctIndex: 2
  },
  {
    id: 5,
    question:
      "Q5: Event Bubbling Quiz\n\n" +
      "<div id=\"parent\">\n" +
      "  <button id=\"child\">Click</button>\n" +
      "</div>\n\n" +
      "If both have click listeners, what order do they fire (default)?",
    options: [
      "Parent then Child",
      "Child then Parent",
      "Only Child",
      "Random order"
    ],
    correctIndex: 1
  },
  {
    id: 6,
    question:
      "Q6: CSS Grid Mystery\n\n" +
      ".grid {\n" +
      "  display: grid;\n" +
      "  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n" +
      "}\n\n" +
      "What does auto-fit do differently from auto-fill?",
    options: [
      "Nothing, they're identical",
      "Collapses empty tracks",
      "Creates more columns",
      "Only works with fixed widths"
    ],
    correctIndex: 1
  },
  {
    id: 7,
    question:
      "Q7: Promise Chain Challenge\n\n" +
      "Promise.resolve(5)\n" +
      "  .then(x => x * 2)\n" +
      "  .then(x => x + 3)\n" +
      "  .then(console.log);\n\n" +
      "What gets logged?",
    options: ["5", "10", "13", "undefined"],
    correctIndex: 2
  },
  {
    id: 8,
    question:
      "Q8: Position Property Puzzle\n\n" +
      "An element with position: sticky behaves like which position until its scroll threshold?",
    options: ["absolute", "fixed", "relative", "static"],
    correctIndex: 2
  },
  {
    id: 9,
    question:
      "Q9: Array Method Magic\n\n" +
      "[1, 2, 3].reduce((acc, val) => acc + val, 10);\n\n" +
      "What's the result?",
    options: ["6", "16", "60", "Error"],
    correctIndex: 1
  },
  {
    id: 10,
    question:
      "Q10: CSS Transform Origin\n\n" +
      "When you apply transform: rotate(45deg), what's the default transform-origin?",
    options: ["top left", "center center", "bottom right", "0 0"],
    correctIndex: 1
  },
  {
    id: 11,
    question:
      "Q11: Async/Await Trap\n\n" +
      "async function test() {\n" +
      "  console.log('A');\n" +
      "  await Promise.resolve();\n" +
      "  console.log('B');\n" +
      "}\n" +
      "test();\n" +
      "console.log('C');\n\n" +
      "What's the output order?",
    options: ["A, B, C", "A, C, B", "C, A, B", "A, B, C (parallel)"],
    correctIndex: 1
  },
  {
    id: 12,
    question:
      "Q12: CSS Custom Properties Cascade\n\n" +
      ":root { --color: red; }\n" +
      ".child { color: var(--color, blue); }\n" +
      ".parent { --color: green; }\n\n" +
      "What color is .child inside .parent?",
    options: ["red", "blue", "green", "black"],
    correctIndex: 2
  },
  {
    id: 13,
    question:
      "Q13: JavaScript Closure Challenge\n\n" +
      "for (var i = 0; i < 3; i++) {\n" +
      "  setTimeout(() => console.log(i), 100);\n" +
      "}\n\n" +
      "What gets logged?",
    options: ["0, 1, 2", "3, 3, 3", "undefined × 3", "2, 2, 2"],
    correctIndex: 1
  },
  {
    id: 14,
    question:
      "Q14: Intersection Observer Trick\n\n" +
      "What's the default threshold value for IntersectionObserver?",
    options: ["0", "0.5", "1", "[0, 1]"],
    correctIndex: 0
  },
  {
    id: 15,
    question:
      "Q15: CSS Containment Property\n\n" +
      "What does contain: layout prevent?",
    options: [
      "External CSS from affecting element",
      "Layout recalculation outside element",
      "Element from being displayed",
      "Children from overflowing"
    ],
    correctIndex: 1
  },
  {
    id: 16,
    question:
      "Q16: Web Storage Limits\n\n" +
      "What's the typical localStorage limit per origin in most browsers?",
    options: ["1MB", "5MB", "10MB", "Unlimited"],
    correctIndex: 1
  },
  {
    id: 17,
    question:
      "Q17: SVG viewBox Mystery\n\n" +
      "In <svg viewBox=\"0 0 100 100\">, what do the four numbers represent?",
    options: [
      "x, y, width, height",
      "top, left, bottom, right",
      "width, height, x, y",
      "minX, maxX, minY, maxY"
    ],
    correctIndex: 0
  },
  {
    id: 18,
    question:
      "Q18: JavaScript Prototype Chain\n\n" +
      "const obj = Object.create(null);\n" +
      "obj.toString();\n\n" +
      "What happens?",
    options: [
      "Returns \"[object Object]\"",
      "Returns \"null\"",
      "TypeError",
      "Returns \"\""
    ],
    correctIndex: 2
  },
  {
    id: 19,
    question:
      "Q19: CSS Backdrop-filter Performance\n\n" +
      "Why is backdrop-filter considered expensive?",
    options: [
      "Large file size",
      "Requires multiple render passes",
      "Not hardware accelerated",
      "Blocks main thread"
    ],
    correctIndex: 1
  },
  {
    id: 20,
    question:
      "Q20: Service Worker Scope\n\n" +
      "If a service worker is registered at /app/sw.js, what's its default scope?",
    options: ["/", "/app/", "/app/sw.js", "Everything"],
    correctIndex: 1
  }
];

// Helper function to reorder
const reorder = (order) => order.map(i => baseQuestions[i]);

const questionSets = {
  A: baseQuestions,
  B: reorder([10, 3, 7, 1, 15, 5, 18, 0, 12, 9, 6, 14, 2, 17, 11, 4, 8, 16, 13, 19]),
  C: reorder([4, 9, 1, 13, 7, 15, 3, 11, 0, 18, 6, 16, 12, 8, 2, 19, 5, 10, 14, 17]),
  D: reorder([6, 14, 0, 12, 9, 3, 17, 5, 10, 18, 1, 7, 15, 11, 19, 2, 16, 4, 8, 13])
};

module.exports = questionSets;
