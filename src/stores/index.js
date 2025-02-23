import {defineStore} from 'pinia'
import ClientsRepository from "@/repositories/clients.repository.js";
import CompaniesRepository from "@/repositories/companies.repository.js";
import IncomesRepository from "@/repositories/incomes.repository.js";
import ExpensesRepository from "@/repositories/expenses.repository.js";
import ProjectsRepository from "@/repositories/projects.repository.js";
import ProductsRepository from "@/repositories/products.repository.js";
import InvoicesRepository from "@/repositories/invoices.repository.js";

export const useCounterStore = defineStore("counter", {
  state(){
    return{
      clients: [],
      companies: [],
      incomes: [],
      expenses: [],
      projects: [],
      products: null,
      expense_categories: [],
      income_categories: [],
      product_categories: [],
      taxes: [],
      invoices: [],
      selectedCompany: JSON.parse(localStorage.getItem("selectedCompany")) || null
    }
  },

  getters: {
    isSelectedCompany: (state) => !!state.selectedCompany && !!state.selectedCompany.id,
    getClientById: (state) => (id) => state.clients.find((item) => item.id == id)
  },

  actions: {
    async loadClients() {
      const repositoryClients = new ClientsRepository();
      const response = await repositoryClients.getAllClients();
      this.clients = response.data
    },
    async loadCompanies() {
      const repositoryCompanies = new CompaniesRepository();
      const response = await repositoryCompanies.getAllCompanies();
      this.companies = response.data
    },
    async loadIncomes(params = {}) {
      const repositoryIncomes = new IncomesRepository()
      this.incomes = await repositoryIncomes.getAllIncomes(params)
    },
    async loadIncomeCategories() {
      const repositoryIncomes = new IncomesRepository();
      const response = await repositoryIncomes.getAllIncomesCategories();
      this.income_categories = response.data
    },
    async loadExpenses(params = {}) {
      const repositoryExpenses = new ExpensesRepository()
      this.expenses = await repositoryExpenses.getAllExpenses(params)
    },
    async loadExpenseCategories() {
      const repositoryExpenses = new ExpensesRepository();
      const response = await repositoryExpenses.getAllExpensesCategories();
      this.expense_categories = response.data
    },
    async loadProjects(params = {}) {
      const repositoryProjects = new ProjectsRepository()
      this.projects = await repositoryProjects.getAllProjects(params)
    },
    async loadProducts(params = {}) {
      const repositoryProducts = new ProductsRepository();
      this.products = await repositoryProducts.getAllProducts(params);
    },
    async loadProductCategories() {
      const repositoryProducts = new ProductsRepository();
      const response = await repositoryProducts.getAllProductCategories();
      this.product_categories = response.data
    },
    async loadTaxes() {
      const repositoryProducts = new ProductsRepository();
      const response = await repositoryProducts.getAllTaxes();
      this.taxes = response.data
    },
    async loadInvoices(params = {}) {
      const repositoryInvoices = new InvoicesRepository()
      this.invoices = await repositoryInvoices.getAllInvoices(params)
    }
  }
});