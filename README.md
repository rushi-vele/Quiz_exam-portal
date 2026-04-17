# QuizMaster: Advanced Online Quiz & Exam Portal

A robust, full-stack examination ecosystem engineered with a focus on real-time coding assessments and semantic evaluation.

## 🚀 Key Features

*   **Intelligent Code Execution**: Integrated STDIN-aware terminal supporting Python and JavaScript with 10s timeout protection.
*   **Test-Case Driven Evaluation**: Evaluations based on functional output matching against multiple tactical test cases.
*   **Administrative Oversight**: Complete CRUD for exams, student management, and real-time result analytics.
*   **Secure Assessment Environment**: Proctoring notices, session locking, and anti-cheating measures.
*   **Automated Results**: Immediate grading for MCQs, Short Answers, and Coding questions with detailed feedback.

## 🛠️ Tech Stack

*   **Frontend**: React, Tailwind CSS, Monaco Editor, Lucide React.
*   **Backend**: Node.js, Express.
*   **Database**: Turso (libSQL/SQLite) for high-performance distributed storage.
*   **Security**: JWT Authentication, Child Process Sandboxing.

## 🚦 Getting Started

### Local Setup

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/rushi-vele/Quiz_exam-portal.git
    ```

2.  **Initialize Backend**:
    ```bash
    cd backend
    npm install
    npm run dev
    ```

3.  **Initialize Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

### Environment Variables
Ensure you have a `.env` file in the `backend` directory with:
* `TURSO_DATABASE_URL`
* `TURSO_AUTH_TOKEN`
* `JWT_SECRET`

---
*Created and maintained by [Bhavana Rushi Vele](mailto:Bhavanarushivele.crestonix@outlook.com)*
