import { createI18n } from 'vue-i18n'

const messages = {
  es: {
    common: {
      save: 'Guardar',
      update: 'Actualizar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Añadir',
      previous: 'Anterior',
      next: 'Siguiente',
      page: 'Página',
      of: 'de',
      search: 'Buscar',
      filter: 'Filtrar',
      reset: 'Restablecer',
      confirm: 'Confirmar',
      date: 'Fecha',
      amount: 'Cantidad',
      description: 'Descripción',
      category: 'Categoría',
      company: 'Empresa',
      recurring: 'Recurrente',
      actions: 'Acciones',
      lastUpdate: 'Última actualización',
      name: 'Nombre',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      address: 'Dirección',
      close: 'Cerrar',
      create: 'Crear',
      select: 'Seleccionar',
      optional: 'opcional',
      notes: 'Notas',
      status: 'Estado',
      type: 'Tipo',
      price: 'Precio',
      quantity: 'Cantidad',
      tax: 'Impuesto',
      subtotal: 'Subtotal',
      total: 'Total',
      product: 'Producto',
      products: 'Productos'
    },
    menu: {
      dashboard: 'Dashboard',
      clients: 'Clientes',
      projects: 'Proyectos',
      invoices: 'Facturas',
      products: 'Productos',
      finances: 'FINANZAS',
      incomes: 'Ingresos',
      expenses: 'Gastos',
      settings: 'Ajustes',
      companies: 'Empresas',
      profile: 'Perfil',
      logout: 'Cerrar sesión'
    },
    incomes: {
      title: 'Ingresos',
      new: 'Añadir Ingreso',
      edit: 'Editar Ingreso',
      close: 'Cerrar Formulario',
      search: 'Buscar ingreso...',
      allCategories: 'Todas las categorías',
      filters: {
        show: 'Mostrar filtros',
        hide: 'Ocultar filtros',
        reset: 'Restablecer filtros',
        dateRange: 'Rango de fechas',
        amountRange: 'Rango de importes',
        recurring: 'Solo ingresos recurrentes',
        taxDeductible: 'Solo ingresos deducibles',
        max: 'Máximo',
        min: 'Mínimo',
        to: 'a'
      },
      form: {
        new: 'Nuevo Ingreso',
        edit: 'Editar Ingreso',
        amount: 'Cantidad',
        date: 'Fecha',
        description: 'Descripción',
        category: 'Categoría',
        selectCategory: 'Selecciona una categoría',
        taxDeductible: 'El impuesto es deducible',
        recurring: 'Es recurrente',
        recurrenceFrequency: 'Frecuencia de recurrencia',
        daily: 'Diario',
        weekly: 'Semanal',
        monthly: 'Mensual',
        yearly: 'Anual'
      },
      deleteConfirmation: {
        title: 'Confirmar eliminación',
        message: '¿Estás seguro de que quieres eliminar este ingreso?'
      },
      noDescription: 'Sin descripción'
    },
    clients: {
      title: 'Clientes',
      search: 'Buscar cliente por nombre...',
      add: 'Añadir Cliente',
      edit: 'Editar Cliente',
      delete: 'Eliminar Cliente',
      deleteConfirmation: {
        title: 'Confirmar eliminación',
        message: '¿Estás seguro de que quieres eliminar este cliente?'
      },
      form: {
        title: {
          add: 'Añadir Cliente',
          edit: 'Editar Cliente'
        },
        name: 'Nombre',
        email: 'Correo electrónico',
        phone: 'Teléfono',
        address: 'Dirección',
        submit: {
          add: 'Añadir',
          update: 'Actualizar'
        }
      }
    },
    invoices: {
      title: 'Facturas',
      new: 'Nueva Factura',
      edit: 'Editar Factura',
      client: 'Cliente',
      project: 'Proyecto',
      issueDate: 'Fecha de emisión',
      status: {
        draft: 'Borrador',
        sent: 'Enviada',
        paid: 'Pagada',
        overdue: 'Vencida'
      },
      type: {
        income: 'Ingreso',
        expense: 'Gasto'
      },
      productName: 'Nombre del Producto',
      addProduct: 'Añadir Producto',
      removeProduct: 'Eliminar Producto',
      taxAmount: 'Impuestos',
      createInvoice: 'Crear Factura',
      updateInvoice: 'Actualizar Factura'
    }
  },
  en: {
    common: {
      save: 'Save',
      update: 'Update',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      search: 'Search',
      filter: 'Filter',
      reset: 'Reset',
      confirm: 'Confirm',
      date: 'Date',
      amount: 'Amount',
      description: 'Description',
      category: 'Category',
      company: 'Company',
      recurring: 'Recurring',
      actions: 'Actions',
      lastUpdate: 'Last update',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      close: 'Close',
      create: 'Create',
      select: 'Select',
      optional: 'optional',
      notes: 'Notes',
      status: 'Status',
      type: 'Type',
      price: 'Price',
      quantity: 'Quantity',
      tax: 'Tax',
      subtotal: 'Subtotal',
      total: 'Total',
      product: 'Product',
      products: 'Products'
    },
    menu: {
      dashboard: 'Dashboard',
      clients: 'Clients',
      projects: 'Projects',
      invoices: 'Invoices',
      products: 'Products',
      finances: 'FINANCES',
      incomes: 'Incomes',
      expenses: 'Expenses',
      settings: 'Settings',
      companies: 'Companies',
      profile: 'Profile',
      logout: 'Log out'
    },
    incomes: {
      title: 'Incomes',
      add: 'Add Income',
      close: 'Close Form',
      search: 'Search income...',
      allCategories: 'All categories',
      filters: {
        show: 'Show filters',
        hide: 'Hide filters',
        reset: 'Reset filters',
        dateRange: 'Date range',
        amountRange: 'Amount range',
        recurring: 'Only recurring incomes',
        taxDeductible: 'Only tax-deductible incomes',
        max: 'Maximum',
        min: 'Minimum',
        to: 'to'
      },
      form: {
        new: 'New Income',
        edit: 'Edit Income',
        amount: 'Amount',
        date: 'Date',
        description: 'Description',
        category: 'Category',
        selectCategory: 'Select a category',
        taxDeductible: 'Tax is deductible',
        recurring: 'Is recurring',
        recurrenceFrequency: 'Recurrence frequency',
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        yearly: 'Yearly'
      },
      deleteConfirmation: {
        title: 'Confirm deletion',
        message: 'Are you sure you want to delete this income?'
      },
      noDescription: 'No description'
    },
    clients: {
      title: 'Clients',
      search: 'Search client by name...',
      add: 'Add Client',
      edit: 'Edit Client',
      delete: 'Delete Client',
      deleteConfirmation: {
        title: 'Confirm deletion',
        message: 'Are you sure you want to delete this client?'
      },
      form: {
        title: {
          add: 'Add Client',
          edit: 'Edit Client'
        },
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        submit: {
          add: 'Add',
          update: 'Update'
        }
      }
    },
    invoices: {
      title: 'Invoices',
      new: 'New Invoice',
      edit: 'Edit Invoice',
      client: 'Client',
      project: 'Project',
      issueDate: 'Issue Date',
      status: {
        draft: 'Draft',
        sent: 'Sent',
        paid: 'Paid',
        overdue: 'Overdue'
      },
      type: {
        income: 'Income',
        expense: 'Expense'
      },
      productName: 'Product Name',
      addProduct: 'Add Product',
      removeProduct: 'Remove Product',
      taxAmount: 'Tax Amount',
      createInvoice: 'Create Invoice',
      updateInvoice: 'Update Invoice'
    }
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: 'es',
  fallbackLocale: 'en',
  messages,
})