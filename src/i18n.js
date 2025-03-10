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
      products: 'Productos',
      website: 'Sitio web',
      frequency: 'Frecuencia',
      daily: 'Diario',
      weekly: 'Semanal',
      monthly: 'Mensual',
      yearly: 'Anual',
      allStatuses: 'Todos los estados',
      min: 'Mínimo',
      max: 'Máximo',
      to: 'a'
    },
    menu: {
      dashboard: 'Dashboard',
      employeesTimesheet: 'Horario de Empleados',
      timesheet: 'Fichar',
      timesheetCalendar: 'Calendario de fichaje',
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
    invoices: {
      title: 'Gestión de Facturas',
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
      updateInvoice: 'Actualizar Factura',
      search: 'Buscar por cliente...',
      filters: {
        show: 'Mostrar filtros',
        hide: 'Ocultar filtros',
        reset: 'Restablecer filtros',
        dateRange: 'Rango de fechas',
        amountRange: 'Rango de importes',
        allTypes: 'Todos los tipos'
      },
      deleteConfirmation: '¿Estás seguro de que quieres eliminar esta factura?',
      invoiceNumber: 'Factura #{id}'
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
    companies: {
      title: 'Empresas',
      add: 'Añadir Empresa',
      edit: 'Editar Empresa',
      closeForm: 'Cerrar Formulario',
      new: 'Nueva Empresa',
      form: {
        name: 'Nombre empresa',
        phone: 'Teléfono',
        email: 'Correo electrónico',
        website: 'Web',
        address: 'Dirección',
        save: 'Guardar Empresa'
      },
      deleteConfirmation: {
        title: 'Confirmar eliminación',
        message: '¿Estás seguro de que quieres eliminar esta empresa?'
      }
    },
    incomes: {
      title: 'Ingresos',
      new: 'Nuevo Ingreso',
      edit: 'Editar Ingreso',
      closeForm: 'Cerrar Formulario',
      search: 'Buscar ingreso...',
      allCategories: 'Todas las categorías',
      filters: {
        show: 'Mostrar filtros',
        hide: 'Ocultar filtros',
        reset: 'Restablecer filtros',
        dateRange: 'Rango de fechas',
        amountRange: 'Rango de importes',
        recurring: 'Solo ingresos recurrentes',
        taxDeductible: 'Solo ingresos deducibles'
      },
      form: {
        amount: 'Cantidad',
        date: 'Fecha',
        description: 'Descripción',
        category: 'Categoría',
        selectCategory: 'Selecciona una categoría',
        taxDeductible: 'El impuesto es deducible',
        recurring: 'Es recurrente',
        recurrenceFrequency: 'Frecuencia de recurrencia'
      },
      deleteConfirmation: {
        title: 'Confirmar eliminación',
        message: '¿Estás seguro de que quieres eliminar este ingreso?'
      },
      noDescription: 'Sin descripción',
      save: 'Guardar Gasto',
      update: 'Actualizar Gasto'
    },
    expenses: {
      title: 'Gastos',
      new: 'Nuevo Gasto',
      edit: 'Editar Gasto',
      closeForm: 'Cerrar Formulario',
      search: 'Buscar gasto...',
      allCategories: 'Todas las categorías',
      filters: {
        show: 'Mostrar filtros',
        hide: 'Ocultar filtros',
        reset: 'Restablecer filtros',
        dateRange: 'Rango de fechas',
        amountRange: 'Rango de importes',
        recurring: 'Solo gastos recurrentes',
        taxDeductible: 'Solo gastos deducibles'
      },
      form: {
        amount: 'Cantidad',
        date: 'Fecha',
        description: 'Descripción',
        category: 'Categoría',
        selectCategory: 'Selecciona una categoría',
        taxDeductible: 'El impuesto es deducible',
        recurring: 'Es recurrente',
        recurrenceFrequency: 'Frecuencia de recurrencia'
      },
      deleteConfirmation: {
        title: 'Confirmar eliminación',
        message: '¿Estás seguro de que quieres eliminar este gasto?'
      },
      noDescription: 'Sin descripción',
      save: 'Guardar Gasto',
      update: 'Actualizar Gasto'
    },
    footer: {
      title: 'FacturaApp',
      description: 'Simplifica tu facturación y gestión empresarial',
      quickLinks: 'Enlaces rápidos',
      support: 'Soporte',
      legal: 'Legal',
      dashboard: 'Dashboard',
      clients: 'Clientes',
      invoices: 'Facturas',
      products: 'Productos',
      helpCenter: 'Centro de ayuda',
      contact: 'Contacto',
      faq: 'FAQ',
      termsOfService: 'Términos de servicio',
      privacyPolicy: 'Política de privacidad',
      copyright: '© {year} FacturaApp. Todos los derechos reservados.'
    },
    projects: {
      title: 'Gestión de Proyectos',
      new: 'Nuevo Proyecto',
      search: 'Buscar proyecto...',
      allClients: 'Todos los clientes',
      hideFilters: 'Ocultar filtros',
      showFilters: 'Mostrar filtros',
      titleStatus: 'Estado',
      allStatuses: 'Todos los estados',
      startDateRange: 'Rango de fechas de inicio',
      budgetRange: 'Rango de presupuesto',
      min: 'Mín',
      max: 'Máx',
      resetFilters: 'Restablecer filtros',
      noClient: 'No tiene cliente',
      confirmDelete: '¿Estás seguro de que quieres eliminar este proyecto?',
      form: {
        title: {
          edit: 'Editar Proyecto',
          add: 'Añadir Nuevo Proyecto'
        },
        projectName: 'Nombre del Proyecto',
        client: 'Cliente',
        selectClient: 'Seleccionar Cliente',
        description: 'Descripción',
        startDate: 'Fecha de Inicio',
        endDate: 'Fecha de Fin',
        status: 'Estado',
        budget: 'Presupuesto',
        update: 'Actualizar',
        create: 'Crear'
      },
      status: {
        notStarted: 'No iniciado',
        inProgress: 'En progreso',
        completed: 'Completado',
        onHold: 'En espera'
      }
    },
    timesheet: 'Registro de Horas',
    checkIn: 'Iniciar Jornada',
    checkOut: 'Finalizar Jornada',
    currentLocation: 'Ubicación Actual',
    locationNotAvailable: 'Ubicación no disponible',
    loading: 'Cargando...',
    geolocationNotSupported: 'Tu navegador no soporta geolocalización.',
    locationError: 'No se pudo obtener tu ubicación: {error}',
    checkInSuccess: '¡Inicio de jornada registrado con éxito!',
    checkInError: 'Error al iniciar la jornada: {error}',
    checkOutSuccess: '¡Fin de jornada registrado con éxito!',
    checkOutError: 'Error al finalizar la jornada: {error}',
    todayEntries: 'Fichajes de Hoy',
    totalHoursWorked: 'Total horas trabajadas',
    timesheetCalendar: 'Calendario de Fichajes',
    noEntriesForThisDay: 'No hay fichajes para este día',
    loadingEntries: 'Cargando fichajes...',
    notes: 'Notas',
    employeeSchedule: 'Horario de Empleado',
    checkInSuccessful: 'Entrada registrada con éxito',
    checkOutSuccessful: 'Salida registrada con éxito',
    selectEmployee: 'Selecciona un empleado',
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
      products: 'Products',
      website: 'Website',
      frequency: 'Frequency',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
      allStatuses: 'All statuses',
      min: 'Minimum',
      max: 'Maximum',
      to: 'to'
    },
    menu: {
      dashboard: 'Dashboard',
      employeesTimesheet: 'Employees Timesheet',
      timesheet: 'Clock In/Out',
      timesheetCalendar: 'Timesheet Calendar',
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
    invoices: {
      title: 'Invoice Management',
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
      updateInvoice: 'Update Invoice',
      search: 'Search by client...',
      filters: {
        show: 'Show filters',
        hide: 'Hide filters',
        reset: 'Reset filters',
        dateRange: 'Date range',
        amountRange: 'Amount range',
        allTypes: 'All types'
      },
      deleteConfirmation: 'Are you sure you want to delete this invoice?',
      invoiceNumber: 'Invoice #{id}'
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
    companies: {
      title: 'Companies',
      add: 'Add Company',
      edit: 'Edit Company',
      closeForm: 'Close Form',
      new: 'New Company',
      form: {
        name: 'Company name',
        phone: 'Phone',
        email: 'Email',
        website: 'Website',
        address: 'Address',
        save: 'Save Company'
      },
      deleteConfirmation: {
        title: 'Confirm deletion',
        message: 'Are you sure you want to delete this company?'
      }
    },
    incomes: {
      title: 'Incomes',
      new: 'New Income',
      edit: 'Edit Income',
      closeForm: 'Close Form',
      search: 'Search income...',
      allCategories: 'All categories',
      filters: {
        show: 'Show filters',
        hide: 'Hide filters',
        reset: 'Reset filters',
        dateRange: 'Date range',
        amountRange: 'Amount range',
        recurring: 'Only recurring incomes',
        taxDeductible: 'Only tax-deductible incomes'
      },
      form: {
        amount: 'Amount',
        date: 'Date',
        description: 'Description',
        category: 'Category',
        selectCategory: 'Select a category',
        taxDeductible: 'Tax is deductible',
        recurring: 'Is recurring',
        recurrenceFrequency: 'Recurrence frequency'
      },
      deleteConfirmation: {
        title: 'Confirm deletion',
        message: 'Are you sure you want to delete this income?'
      },
      noDescription: 'No description',
      save: 'Save Expense',
      update: 'Update Expense'
    },
    expenses: {
      title: 'Expenses',
      new: 'New Expense',
      edit: 'Edit Expense',
      closeForm: 'Close Form',
      search: 'Search expense...',
      allCategories: 'All categories',
      filters: {
        show: 'Show filters',
        hide: 'Hide filters',
        reset: 'Reset filters',
        dateRange: 'Date range',
        amountRange: 'Amount range',
        recurring: 'Only recurring expenses',
        taxDeductible: 'Only tax-deductible expenses'
      },
      form: {
        amount: 'Amount',
        date: 'Date',
        description: 'Description',
        category: 'Category',
        selectCategory: 'Select a category',
        taxDeductible: 'Tax is deductible',
        recurring: 'Is recurring',
        recurrenceFrequency: 'Recurrence frequency'
      },
      deleteConfirmation: {
        title: 'Confirm deletion',
        message: 'Are you sure you want to delete this expense?'
      },
      noDescription: 'No description',
      save: 'Save Expense',
      update: 'Update Expense'
    },
    footer: {
      title: 'FacturaApp',
      description: 'Simplify your invoicing and business management',
      quickLinks: 'Quick Links',
      support: 'Support',
      legal: 'Legal',
      dashboard: 'Dashboard',
      clients: 'Clients',
      invoices: 'Invoices',
      products: 'Products',
      helpCenter: 'Help Center',
      contact: 'Contact',
      faq: 'FAQ',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
      copyright: '© {year} FacturaApp. All rights reserved.'
    },
    projects: {
      title: 'Project Management',
      new: 'New Project',
      search: 'Search project...',
      allClients: 'All clients',
      hideFilters: 'Hide filters',
      showFilters: 'Show filters',
      titleStatus: 'Status',
      allStatuses: 'All statuses',
      startDateRange: 'Start date range',
      budgetRange: 'Budget range',
      min: 'Min',
      max: 'Max',
      resetFilters: 'Reset filters',
      noClient: 'No client',
      confirmDelete: 'Are you sure you want to delete this project?',
      form: {
        title: {
          edit: 'Edit Project',
          add: 'Add New Project'
        },
        projectName: 'Project Name',
        client: 'Client',
        selectClient: 'Select Client',
        description: 'Description',
        startDate: 'Start Date',
        endDate: 'End Date',
        status: 'Status',
        budget: 'Budget',
        update: 'Update',
        create: 'Create'
      },
      status: {
        notStarted: 'Not started',
        inProgress: 'In progress',
        completed: 'Completed',
        onHold: 'On hold'
      }
    },
    timesheet: 'Timesheet',
    checkIn: 'Check In',
    checkOut: 'Check Out',
    currentLocation: 'Current Location',
    locationNotAvailable: 'Location not available',
    loading: 'Loading...',
    geolocationNotSupported: 'Geolocation is not supported by your browser.',
    locationError: 'Unable to retrieve your location: {error}',
    checkInSuccess: 'Check-in successful!',
    checkInError: 'Error during check-in: {error}',
    checkOutSuccess: 'Check-out successful!',
    checkOutError: 'Error during check-out: {error}',
    todayEntries: 'Today Entries',
    totalHoursWorked: 'Total Hours Worked',
    timesheetCalendar: 'Timesheet Calendar',
    noEntriesForThisDay: 'No entries for this day',
    loadingEntries: 'Loading entries...',
    notes: 'Notes',
    employeeSchedule: 'Employee Schedule',
    checkInSuccessful: 'Check-in successful',
    checkOutSuccessful: 'Check-out successful',
    selectEmployee: 'Select an employee',
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: 'es',
  fallbackLocale: 'en',
  messages,
})