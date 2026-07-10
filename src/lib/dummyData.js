// src/lib/dummyData.js
// -----------------------------------------------------------------------
// Generates realistic-looking demo data so a first-time user immediately
// sees what PulaTrack looks like in action, instead of empty states.
// Called once from AuthContext right after a brand-new account is created.
// -----------------------------------------------------------------------
import { collection, doc, setDoc, writeBatch } from "firebase/firestore";
import { db } from "@/firebase";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/utils";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function generateDummyData(userId) {
  const batch = writeBatch(db);
  const now = new Date();

  // ---- Transactions: last 6 months, ~8-14 per month ----
  for (let m = 0; m < 6; m++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);

    // Salary income once a month
    const salaryDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), randomInt(1, 5));
    const salaryRef = doc(collection(db, "users", userId, "transactions"));
    batch.set(salaryRef, {
      type: "Income",
      amount: randomInt(7000, 12000),
      category: "Salary",
      date: salaryDate.toISOString(),
      note: "Monthly salary",
      createdAt: salaryDate.toISOString(),
    });

    // Occasional extra income
    if (Math.random() > 0.5) {
      const extraDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), randomInt(6, 25));
      const extraRef = doc(collection(db, "users", userId, "transactions"));
      batch.set(extraRef, {
        type: "Income",
        amount: randomInt(300, 2000),
        category: randomPick(["Business", "Gift", "Other"]),
        date: extraDate.toISOString(),
        note: "Side income",
        createdAt: extraDate.toISOString(),
      });
    }

    // Expenses
    const expenseCount = randomInt(8, 14);
    for (let e = 0; e < expenseCount; e++) {
      const expDate = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        randomInt(1, 28)
      );
      const category = randomPick(EXPENSE_CATEGORIES);
      const amountRanges = {
        Food: [50, 600],
        Transport: [30, 400],
        Rent: [2500, 4500],
        "Airtime/Data": [20, 250],
        Shopping: [100, 1200],
        Bills: [150, 900],
        Other: [40, 500],
      };
      const [min, max] = amountRanges[category] || [50, 300];
      const ref = doc(collection(db, "users", userId, "transactions"));
      batch.set(ref, {
        type: "Expense",
        amount: randomInt(min, max),
        category,
        date: expDate.toISOString(),
        note: "",
        createdAt: expDate.toISOString(),
      });
    }
  }

  // ---- Budgets for current month ----
  const budgetDefaults = {
    Food: 1800,
    Transport: 900,
    Rent: 3500,
    "Airtime/Data": 300,
    Shopping: 1000,
    Bills: 800,
    Other: 500,
  };
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  Object.entries(budgetDefaults).forEach(([category, amount]) => {
    const ref = doc(collection(db, "users", userId, "budgets"));
    batch.set(ref, {
      category,
      amount,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      monthKey,
    });
  });

  // ---- Savings goals ----
  const goals = [
    { title: "New Phone", targetAmount: 8000, currentAmount: 2300, icon: "Smartphone" },
    { title: "Emergency Fund", targetAmount: 15000, currentAmount: 6100, icon: "ShieldCheck" },
    { title: "Trip to Cape Town", targetAmount: 6000, currentAmount: 1450, icon: "Plane" },
  ];
  goals.forEach((g) => {
    const ref = doc(collection(db, "users", userId, "goals"));
    batch.set(ref, {
      ...g,
      deadline: new Date(now.getFullYear(), now.getMonth() + randomInt(2, 8), 1).toISOString(),
      createdAt: new Date().toISOString(),
    });
  });

  await batch.commit();
}

// Small helper exported for reuse in forms
export { INCOME_CATEGORIES, EXPENSE_CATEGORIES };
