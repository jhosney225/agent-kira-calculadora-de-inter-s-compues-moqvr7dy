
```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Tool definitions for the compound interest calculator
const tools = [
  {
    name: "calculate_compound_interest",
    description:
      "Calculates compound interest for an investment. Returns the final amount and total interest earned.",
    input_schema: {
      type: "object",
      properties: {
        principal: {
          type: "number",
          description: "The initial investment amount in dollars",
        },
        rate: {
          type: "number",
          description: "The annual interest rate as a percentage (e.g., 5 for 5%)",
        },
        time: {
          type: "number",
          description: "The time period in years",
        },
        compounds_per_year: {
          type: "number",
          description:
            "How many times per year the interest is compounded (1=annual, 2=semi-annual, 4=quarterly, 12=monthly, 365=daily)",
        },
      },
      required: ["principal", "rate", "time", "compounds_per_year"],
    },
  },
  {
    name: "compare_investments",
    description:
      "Compares two different investment scenarios side by side to help choose the best option.",
    input_schema: {
      type: "object",
      properties: {
        principal1: {
          type: "number",
          description: "Initial amount for first investment",
        },
        rate1: {
          type: "number",
          description: "Annual rate for first investment",
        },
        time1: {
          type: "number",
          description: "Time period in years for first investment",
        },
        compounds1: {
          type: "number",
          description: "Compounding frequency for first investment",
        },
        principal2: {
          type: "number",
          description: "Initial amount for second investment",
        },
        rate2: {
          type: "number",
          description: "Annual rate for second investment",
        },
        time2: {
          type: "number",
          description: "Time period in years for second investment",
        },
        compounds2: {
          type: "number",
          description: "Compounding frequency for second investment",
        },
      },
      required: [
        "principal1",
        "rate1",
        "time1",
        "compounds1",
        "principal2",
        "rate2",
        "time2",
        "compounds2",
      ],
    },
  },
  {
    name: "calculate_required_principal",
    description:
      "Calculates how much principal is needed to reach a target amount.",
    input_schema: {
      type: "object",
      properties: {
        target_amount: {
          type: "number",
          description: "The desired final amount in dollars",
        },
        rate: {
          type: "number",
          description: "The annual interest rate as a percentage",
        },
        time: {
          type: "number",
          description: "The time period in years",
        },
        compounds_per_year: {
          type: "number",
          description: "How many times per year the interest is compounded",
        },
      },
      required: ["target_amount", "rate", "time", "compounds_per_year"],
    },
  },
];

// Function implementations
function calculateCompoundInterest(principal, rate, time, compoundsPerYear) {
  const rateDecimal = rate / 100;
  const amount =
    principal * Math.pow(1 + rateDecimal / compoundsPerYear, compoundsPerYear * time);
  const interest = amount - principal;

  return {
    principal: parseFloat(principal.toFixed(2)),
    rate: rate,
    time: time,
    compounding_frequency: compoundsPerYear,
    final_amount: parseFloat(amount.toFixed(2)),
    total_interest: parseFloat(interest.toFixed(2)),
  };
}

function compareInvestments(principal1, rate1, time1, compounds1, principal2, rate2, time2, compounds2) {
  const investment1 = calculateCompoundInterest(principal1, rate1, time1, compounds1);
  const investment2 = calculateCompoundInterest(principal2, rate2, time2, compounds2);

  const difference = investment1.final_amount - investment2.final_amount;
  const betterInvestment = difference > 0 ? "Investment 1" : "Investment 2";

  return {
    investment_1: investment1,
    investment_2: investment2,
    difference: parseFloat(Math.abs(difference).toFixed(2)),
    better_investment: betterInvestment,
    recommendation: `${betterInvestment} returns $${Math.abs(difference).toFixed(2)} more after ${Math.max(time1, time2)} years`,
  };
}

function calculateRequiredPrincipal(targetAmount, rate, time, compoundsPerYear) {
  const rateDecimal = rate / 100;
  const principal =
    targetAmount / Math.pow(1 + rateDecimal / compoundsPerYear, compoundsPerYear * time);

  return {
    target_amount: parseFloat(targetAmount.toFixed(2)),
    rate: rate,
    time: time,
    compounding_frequency: compoundsPerYear,
    required_principal: parseFloat(principal.toFixed(2)),
    note: `Invest $${principal.toFixed(2)} to reach $${targetAmount.toFixed(2)} in ${time} years`,
  };
}

// Process tool calls
function processToolCall(toolName, toolInput) {
  switch (toolName) {
    case "calculate_compound_interest":
      return calculateCompoundInterest(
        toolInput.principal,
        toolInput.rate,
        toolInput.time,
        