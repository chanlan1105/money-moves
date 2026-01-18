# Money Moves

> An all-in-one platform for budgeting and managing your expenses with dynamic AI integration and a friendly UI.

---

## About the Project
Having many sources of payment today is common practice. This makes having a clear portrait of your budget much more difficult as your expenditures are separated across different platforms. [Insert project title here] is a website that addresses this problem.

### Built With
* Next.js
* PostgreSQL
* Tailwind CSS


---

## Getting Started

### Environment configuration
At the root of the project, create a `.env` file with:
```
POSTGRES_URL="your_postgres_connection_string"
GEMINI_API_KEY="your_api_key"
```

### Running the website
1. **Clone the repo**
```bash
git clone [https://github.com/chanlan1105/money-moves.git]
```

2. **Install dependencies**
```bash
pnpm i
```
3. **Run development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
4. **Open in browser**

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Usage

1. Upload you bank account or credit card statements in `.csv` format in the Upload tab.
2. Define monthly budget limits on a per-category basis for the month or the year in the Budget tab.
3. Visualize your expenditures in the Expenses tab.

