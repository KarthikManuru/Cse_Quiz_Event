// Each set must have exactly 10 questions
// correctIndex = 0/1/2/3 (index in the options array)

const questionSets = {
  A: [
    {
      id: 1,
      question: "In C, which header file is required for printf()?",
      options: ["<stdio.h>", "<conio.h>", "<stdlib.h>", "<string.h>"],
      correctIndex: 0
    },
    {
      id: 2,
      question: "Which data structure works on FIFO principle?",
      options: ["Stack", "Queue", "Tree", "Graph"],
      correctIndex: 1
    },
    {
      id: 1,
      question: "In C, which header file is required for printf()?",
      options: ["<stdio.h>", "<conio.h>", "<stdlib.h>", "<string.h>"],
      correctIndex: 0
    },
    {
      id: 2,
      question: "Which data structure works on FIFO principle?",
      options: ["Stack", "Queue", "Tree", "Graph"],
      correctIndex: 1
    },
    {
      id: 1,
      question: "In C, which header file is required for printf()?",
      options: ["<stdio.h>", "<conio.h>", "<stdlib.h>", "<string.h>"],
      correctIndex: 0
    },
    {
      id: 2,
      question: "Which data structure works on FIFO principle?",
      options: ["Stack", "Queue", "Tree", "Graph"],
      correctIndex: 1
    },
    {
      id: 1,
      question: "In C, which header file is required for printf()?",
      options: ["<stdio.h>", "<conio.h>", "<stdlib.h>", "<string.h>"],
      correctIndex: 0
    },
    {
      id: 2,
      question: "Which data structure works on FIFO principle?",
      options: ["Stack", "Queue", "Tree", "Graph"],
      correctIndex: 1
    },
    {
      id: 1,
      question: "In C, which header file is required for printf()?",
      options: ["<stdio.h>", "<conio.h>", "<stdlib.h>", "<string.h>"],
      correctIndex: 0
    },
    {
      id: 2,
      question: "Which data structure works on FIFO principle?",
      options: ["Stack", "Queue", "Tree", "Graph"],
      correctIndex: 1
    }
    // ... add up to 10 questions
  ],
  B: [
    {
      id: 1,
      question: "Which of these is a NoSQL database?",
      options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
      correctIndex: 2
    },
    {
      id: 2,
      question: "HTML stands for?",
      options: [
        "Hyperlinks and Text Markup Language",
        "Hyper Text Markup Language",
        "Home Tool Markup Language",
        "Hyper Transfer Markup Language"
      ],
      correctIndex: 1
    },
    {
      id: 1,
      question: "Which of these is a NoSQL database?",
      options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
      correctIndex: 2
    },
    {
      id: 2,
      question: "HTML stands for?",
      options: [
        "Hyperlinks and Text Markup Language",
        "Hyper Text Markup Language",
        "Home Tool Markup Language",
        "Hyper Transfer Markup Language"
      ],
      correctIndex: 1
    },
    {
      id: 1,
      question: "Which of these is a NoSQL database?",
      options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
      correctIndex: 2
    },
    {
      id: 2,
      question: "HTML stands for?",
      options: [
        "Hyperlinks and Text Markup Language",
        "Hyper Text Markup Language",
        "Home Tool Markup Language",
        "Hyper Transfer Markup Language"
      ],
      correctIndex: 1
    },
    {
      id: 1,
      question: "Which of these is a NoSQL database?",
      options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
      correctIndex: 2
    },
    {
      id: 2,
      question: "HTML stands for?",
      options: [
        "Hyperlinks and Text Markup Language",
        "Hyper Text Markup Language",
        "Home Tool Markup Language",
        "Hyper Transfer Markup Language"
      ],
      correctIndex: 1
    },
    {
      id: 1,
      question: "Which of these is a NoSQL database?",
      options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
      correctIndex: 2
    },
    {
      id: 2,
      question: "HTML stands for?",
      options: [
        "Hyperlinks and Text Markup Language",
        "Hyper Text Markup Language",
        "Home Tool Markup Language",
        "Hyper Transfer Markup Language"
      ],
      correctIndex: 1
    }
    // ... up to 10 questions
  ],
  C: [
    {
      id: 1,
      question: "Time complexity of binary search (best case)?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      correctIndex: 0
    },
    {
      id: 2,
      question: "Which of these is not an OOPs concept?",
      options: ["Inheritance", "Encapsulation", "Polymorphism", "Compilation"],
      correctIndex: 3
    },
    {
      id: 1,
      question: "Time complexity of binary search (best case)?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      correctIndex: 0
    },
    {
      id: 2,
      question: "Which of these is not an OOPs concept?",
      options: ["Inheritance", "Encapsulation", "Polymorphism", "Compilation"],
      correctIndex: 3
    },
    {
      id: 1,
      question: "Time complexity of binary search (best case)?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      correctIndex: 0
    },
    {
      id: 2,
      question: "Which of these is not an OOPs concept?",
      options: ["Inheritance", "Encapsulation", "Polymorphism", "Compilation"],
      correctIndex: 3
    },
    {
      id: 1,
      question: "Time complexity of binary search (best case)?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      correctIndex: 0
    },
    {
      id: 2,
      question: "Which of these is not an OOPs concept?",
      options: ["Inheritance", "Encapsulation", "Polymorphism", "Compilation"],
      correctIndex: 3
    },
    {
      id: 1,
      question: "Time complexity of binary search (best case)?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      correctIndex: 0
    },
    {
      id: 2,
      question: "Which of these is not an OOPs concept?",
      options: ["Inheritance", "Encapsulation", "Polymorphism", "Compilation"],
      correctIndex: 3
    }
    // ... up to 10
  ],
  D: [
    {
      id: 1,
      question: "Which protocol is used to browse websites?",
      options: ["FTP", "SMTP", "HTTP/HTTPS", "SSH"],
      correctIndex: 2
    },
    {
      id: 2,
      question: "In OS, which is not a scheduling algorithm?",
      options: ["FCFS", "Round Robin", "SJF", "RSA"],
      correctIndex: 3
    },
    {
      id: 1,
      question: "Which protocol is used to browse websites?",
      options: ["FTP", "SMTP", "HTTP/HTTPS", "SSH"],
      correctIndex: 2
    },
    {
      id: 2,
      question: "In OS, which is not a scheduling algorithm?",
      options: ["FCFS", "Round Robin", "SJF", "RSA"],
      correctIndex: 3
    },
    {
      id: 1,
      question: "Which protocol is used to browse websites?",
      options: ["FTP", "SMTP", "HTTP/HTTPS", "SSH"],
      correctIndex: 2
    },
    {
      id: 2,
      question: "In OS, which is not a scheduling algorithm?",
      options: ["FCFS", "Round Robin", "SJF", "RSA"],
      correctIndex: 3
    },
    {
      id: 1,
      question: "Which protocol is used to browse websites?",
      options: ["FTP", "SMTP", "HTTP/HTTPS", "SSH"],
      correctIndex: 2
    },
    {
      id: 2,
      question: "In OS, which is not a scheduling algorithm?",
      options: ["FCFS", "Round Robin", "SJF", "RSA"],
      correctIndex: 3
    },
    {
      id: 1,
      question: "Which protocol is used to browse websites?",
      options: ["FTP", "SMTP", "HTTP/HTTPS", "SSH"],
      correctIndex: 2
    },
    {
      id: 2,
      question: "In OS, which is not a scheduling algorithm?",
      options: ["FCFS", "Round Robin", "SJF", "RSA"],
      correctIndex: 3
    }
    // ... up to 10
  ]
};

module.exports = questionSets;
