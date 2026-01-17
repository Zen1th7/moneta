const translations = {
    en: {
        // Bottom Nav
        wallets: "Wallets",
        history: "Transactions",
        analytics: "Analytics",
        settings: "Settings",

        // Wallets View
        netWorth: "Total Net Worth",
        addWallet: "Add Wallet",
        noWallets: "No wallets found. Create your first one to get started!",

        // Transaction Form
        addTransaction: "Add Transaction",
        type: "Type",
        income: "Income",
        expense: "Expense",
        transfer: "Transfer",
        wallet: "Wallet",
        targetWallet: "Target Wallet",
        category: "Category",
        amount: "Amount",
        conversionRate: "Conversion Rate",
        transferFee: "Transfer Fee",
        note: "Note",
        date: "Date",
        submit: "Add Transaction",
        saveChanges: "Save Changes",

        // History View
        transactionHistory: "Transaction History",
        noTransactions: "No transactions found for the selected period.",
        filter: "Filter",
        page: "Page",
        of: "of",
        prev: "Prev",
        next: "Next",
        timePeriod: "Time Period",
        allTime: "All Time",
        last7Days: "Last 7 Days",
        last30Days: "Last 30 Days",
        last90Days: "Last 90 Days",
        customRange: "Custom Range",
        startDate: "Start Date",
        endDate: "End Date",
        applyFilter: "Apply Filter",

        // Analytics View
        cashFlowAnalytics: "Cash Flow Analytics",
        overview: "Overview",
        incomeBreakdown: "Income Breakdown",
        expenseBreakdown: "Expense Breakdown",
        noData: "No transaction data for this period.",
        day: "Day",
        month: "Month",
        year: "Year",
        custom: "Custom",
        to: "to",

        // Settings View
        language: "Language",
        appearance: "Appearance",
        themeMode: "Theme Mode",
        darkMode: "Dark Mode",
        lightMode: "Light Mode",
        categoryManagement: "Category Management",
        manageCategoriesFor: "Manage Categories For:",
        addNewCategory: "Add New Category",
        existingCategories: "Existing Categories",
        dataManagement: "Data Management",
        exportJson: "Export JSON",
        exportExcel: "Export to Excel",
        importJson: "Import JSON",

        // Wallet Modal
        walletName: "Wallet Name",
        balance: "Initial Balance",
        currency: "Currency",
        walletIcon: "Wallet Icon",
        cancel: "Cancel",
        delete: "Delete",
        platform: "Platform/Bank",
        selectWallet: "Select wallet...",
        selectDestinationWallet: "Select destination wallet...",
        walletNamePlaceholder: "e.g., Chase Checking, BCA Savings...",
        platformPlaceholder: "e.g., Chase Bank, BCA, E*TRADE...",
        notePlaceholder: "e.g., Lunch at cafe, Monthly salary...",

        // Toasts & Alerts
        transactionAdded: "✅ Transaction registered!",
        transactionUpdated: "✅ Transaction updated!",
        transactionDeleted: "🗑️ Transaction deleted",
        walletCreated: "👛 Wallet created",
        walletUpdated: "👛 Wallet updated",
        walletDeleted: "👛 Wallet deleted",
        importSuccess: "✅ Data imported successfully!",
        importError: "❌ Failed to import data",

        // Currency Specific Wallets (Dynamic Empty States)
        noWalletsNTD: "No NTD wallets yet.",
        noWalletsUSD: "No USD wallets yet.",
        noWalletsIDR: "No IDR wallets yet.",

        // Categories
        catFoodDining: "Food & Dining",
        catFuel: "Fuel",
        catTransportation: "Transportation",
        catHousing: "Housing",
        catUtilities: "Utilities",
        catEntertainment: "Entertainment",
        catShopping: "Shopping",
        catHealthcare: "Healthcare",
        catEducation: "Education",
        catPersonalCare: "Personal Care",
        catSubscriptions: "Subscriptions",
        catOther: "Other",
        catSalary: "Salary",
        catInvestmentReturn: "Investment Return",
        catDividend: "Dividend",
        catFreelance: "Freelance",
        catGift: "Gift",
        catBetweenWallets: "Between Wallets",
    },
    id: {
        // Bottom Nav
        wallets: "Dompet",
        history: "Transaksi",
        analytics: "Analitik",
        settings: "Pengaturan",

        // Wallets View
        netWorth: "Total Kekayaan Bersih",
        addWallet: "Tambah Dompet",
        noWallets: "Belum ada dompet. Buat yang pertama untuk memulai!",

        // Transaction Form
        addTransaction: "Tambah Transaksi",
        type: "Tipe",
        income: "Pemasukan",
        expense: "Pengeluaran",
        transfer: "Transfer",
        wallet: "Dompet",
        targetWallet: "Dompet Tujuan",
        category: "Kategori",
        amount: "Jumlah",
        conversionRate: "Kurs Konversi",
        transferFee: "Biaya Transfer",
        note: "Catatan",
        date: "Tanggal",
        submit: "Tambah Transaksi",
        saveChanges: "Simpan Perubahan",

        // History View
        transactionHistory: "Riwayat Transaksi",
        noTransactions: "Tidak ada transaksi dalam periode ini.",
        filter: "Filter",
        page: "Halaman",
        of: "dari",
        prev: "Seb",
        next: "Sel",
        timePeriod: "Periode Waktu",
        allTime: "Semua Waktu",
        last7Days: "7 Hari Terakhir",
        last30Days: "30 Hari Terakhir",
        last90Days: "90 Hari Terakhir",
        customRange: "Rentang Khusus",
        startDate: "Tanggal Mulai",
        endDate: "Tanggal Selesai",
        applyFilter: "Terapkan Filter",

        // Analytics View
        cashFlowAnalytics: "Analitik Arus Kas",
        overview: "Ringkasan",
        incomeBreakdown: "Rincian Pemasukan",
        expenseBreakdown: "Rincian Pengeluaran",
        noData: "Tidak ada data pada periode ini.",
        day: "Hari",
        month: "Bulan",
        year: "Tahun",
        custom: "Kustom",
        to: "sampai",

        // Settings View
        language: "Bahasa",
        appearance: "Tampilan",
        themeMode: "Mode Tema",
        darkMode: "Mode Gelap",
        lightMode: "Mode Terang",
        categoryManagement: "Kelola Kategori",
        manageCategoriesFor: "Kelola Kategori Untuk:",
        addNewCategory: "Tambah Kategori Baru",
        existingCategories: "Kategori Tersedia",
        dataManagement: "Kelola Data",
        exportJson: "Ekspor JSON",
        exportExcel: "Ekspor ke Excel",
        importJson: "Impor JSON",

        // Wallet Modal
        walletName: "Nama Dompet",
        balance: "Saldo Awal",
        currency: "Mata Uang",
        walletIcon: "Ikon Dompet",
        cancel: "Batal",
        delete: "Hapus",
        platform: "Platform/Bank",
        selectWallet: "Pilih dompet...",
        selectDestinationWallet: "Pilih dompet tujuan...",
        walletNamePlaceholder: "contoh: Tabungan BCA, Mandiri...",
        platformPlaceholder: "contoh: BCA, Mandiri, Jenius...",
        notePlaceholder: "contoh: Makan siang, Gaji bulanan...",

        // Toasts & Alerts
        transactionAdded: "✅ Transaksi dicatat!",
        transactionUpdated: "✅ Transaksi diperbarui!",
        transactionDeleted: "🗑️ Transaksi dihapus",
        walletCreated: "👛 Dompet dibuat",
        walletUpdated: "👛 Dompet diperbarui",
        walletDeleted: "👛 Dompet dihapus",
        importSuccess: "✅ Data berhasil diimpor!",
        importError: "❌ Gagal mengimpor data",

        // Currency Specific Wallets (Dynamic Empty States)
        noWalletsNTD: "Belum ada dompet NTD.",
        noWalletsUSD: "Belum ada dompet USD.",
        noWalletsIDR: "Belum ada dompet IDR.",

        // Categories
        catFoodDining: "Makan & Minum",
        catFuel: "Bensin",
        catTransportation: "Transportasi",
        catHousing: "Tempat Tinggal",
        catUtilities: "Tagihan",
        catEntertainment: "Hiburan",
        catShopping: "Belanja",
        catHealthcare: "Kesehatan",
        catEducation: "Pendidikan",
        catPersonalCare: "Perawatan Diri",
        catSubscriptions: "Langganan",
        catOther: "Lainnya",
        catSalary: "Gaji",
        catInvestmentReturn: "Hasil Investasi",
        catDividend: "Dividen",
        catFreelance: "Freelance",
        catGift: "Hadiah",
        catBetweenWallets: "Antar Dompet",
    },
    zh: {
        // Bottom Nav
        wallets: "錢包",
        history: "交易",
        analytics: "分析",
        settings: "設置",

        // Wallets View
        netWorth: "總資產",
        addWallet: "添加錢包",
        noWallets: "未發現錢包。請創建您的第一個錢包！",

        // Transaction Form
        addTransaction: "添加交易",
        type: "類型",
        income: "收入",
        expense: "支出",
        transfer: "轉帳",
        wallet: "錢包",
        targetWallet: "目標錢包",
        category: "類別",
        amount: "金額",
        conversionRate: "匯率",
        transferFee: "手續費",
        note: "備註",
        date: "日期",
        submit: "添加交易",
        saveChanges: "保存更改",

        // History View
        transactionHistory: "交易歷史",
        noTransactions: "所選期間內無交易記錄。",
        filter: "篩選",
        page: "第",
        of: "頁，共",
        prev: "上一頁",
        next: "下一頁",
        timePeriod: "時間段",
        allTime: "所有時間",
        last7Days: "最近7天",
        last30Days: "最近30天",
        last90Days: "最近90天",
        customRange: "自定義範圍",
        startDate: "開始日期",
        endDate: "結束日期",
        applyFilter: "應用篩選",

        // Analytics View
        cashFlowAnalytics: "現金流分析",
        overview: "概覽",
        incomeBreakdown: "收入詳解",
        expenseBreakdown: "支出詳解",
        noData: "在此期間無交易數據。",
        day: "日",
        month: "月",
        year: "年",
        custom: "自定義",
        to: "至",

        // Settings View
        language: "語言",
        appearance: "外觀",
        themeMode: "主題模式",
        darkMode: "深色模式",
        lightMode: "淺色模式",
        categoryManagement: "類別管理",
        manageCategoriesFor: "管理類別：",
        addNewCategory: "添加新類別",
        existingCategories: "現有類別",
        dataManagement: "數據管理",
        exportJson: "導出 JSON",
        exportExcel: "導出至 Excel",
        importJson: "導入 JSON",

        // Wallet Modal
        walletName: "錢包名稱",
        balance: "初始餘額",
        currency: "幣種",
        walletIcon: "錢包圖標",
        cancel: "取消",
        delete: "刪除",
        platform: "平台/銀行",
        selectWallet: "選擇錢包...",
        selectDestinationWallet: "選擇目標錢包...",
        walletNamePlaceholder: "例如：玉山銀行, 中國信託...",
        platformPlaceholder: "例如：玉山, 中信, 國泰...",
        notePlaceholder: "例如：午餐, 月薪...",

        // Toasts & Alerts
        transactionAdded: "✅ 交易已登記！",
        transactionUpdated: "✅ 交易已更新！",
        transactionDeleted: "🗑️ 交易已刪除",
        walletCreated: "👛 錢包已創建",
        walletUpdated: "👛 錢包已更新",
        walletDeleted: "👛 錢包已刪除",
        importSuccess: "✅ 數據導入成功！",
        importError: "❌ 數據導入失敗",

        // Currency Specific Wallets (Dynamic Empty States)
        noWalletsNTD: "暫無新台幣錢包。",
        noWalletsUSD: "暫無美元錢包。",
        noWalletsIDR: "暫無印尼盾錢包。",

        // Categories
        catFoodDining: "餐飲",
        catFuel: "燃料",
        catTransportation: "交通",
        catHousing: "住房",
        catUtilities: "水電費",
        catEntertainment: "娛樂",
        catShopping: "購物",
        catHealthcare: "醫療",
        catEducation: "教育",
        catPersonalCare: "個人護理",
        catSubscriptions: "訂閱",
        catOther: "其他",
        catSalary: "薪水",
        catInvestmentReturn: "投資回報",
        catDividend: "股息",
        catFreelance: "自由職業",
        catGift: "禮物",
        catBetweenWallets: "錢包轉帳",
    }
};

class I18nManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('appLanguage') || 'en';
        this.translations = translations;
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('appLanguage', lang);
            this.applyTranslations();
        }
    }

    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }

    applyTranslations() {
        // Apply to elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            el.textContent = this.t(key);
        });

        // Apply to placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            el.placeholder = this.t(key);
        });

        // Specific handling for complex elements if needed
        // For example, updating charts or specialized UI components
    }
}

// Global instance
window.i18n = new I18nManager();
