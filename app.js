// Money-management/app.js

document.addEventListener('DOMContentLoaded', () => {
  // Initialize navigation
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchPage(link.dataset.page, link);
    });
  });
  // Event listeners & Modal triggers
  const incomeBtn = document.getElementById('add-income-btn');
  const expenseBtn = document.getElementById('add-expense-btn');
  const incomeModal = document.getElementById('income-modal');
  const expenseModal = document.getElementById('expense-modal');
  incomeBtn.addEventListener('click', () => incomeModal.classList.remove('hidden'));
  expenseBtn.addEventListener('click', () => expenseModal.classList.remove('hidden'));
  // Modals: إغلاق ومتابعة الإرسال
  document.querySelectorAll('.close-btn').forEach(btn => 
    btn.addEventListener('click', () => 
      document.getElementById(btn.dataset.modal).classList.add('hidden')
    )
  );
  document.getElementById('income-form').addEventListener('submit', e => {
    e.preventDefault();
    const date = document.getElementById('income-date').value;
    const amount = parseFloat(document.getElementById('income-amount').value);
    const desc = document.getElementById('income-desc').value;
    if (!date || isNaN(amount)) return;
    const recurringInc = document.getElementById('income-recurring').checked;
    if (state.editingIncomeId != null) {
      const idx = state.incomes.findIndex(i => i.id === state.editingIncomeId);
      if (idx > -1) state.incomes[idx] = { id: state.editingIncomeId, date, amount, desc };
      showNotification('تم تحديث الإيراد', 'success');
      state.editingIncomeId = null;
      incomeModal.querySelector('h3').textContent = 'إضافة إيراد';
      incomeModal.querySelector('button[type="submit"]').textContent = 'حفظ';
    } else {
      state.incomes.push({ id: Date.now(), date, amount, desc });
      if (recurringInc) state.fixedIncomes.push({ amount, desc });
      showNotification('تم إضافة الإيراد', 'success');
    }
    saveState(); renderIncomes(); updateSummary();
    e.target.reset(); incomeModal.classList.add('hidden');
  });
  document.getElementById('expense-form').addEventListener('submit', e => {
    e.preventDefault();
    const date = document.getElementById('expense-date').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const desc = document.getElementById('expense-desc').value;
    if (!date || isNaN(amount)) return;
    const recurringExp = document.getElementById('expense-recurring').checked;
    if (state.editingExpenseId != null) {
      const idx = state.expenses.findIndex(e => e.id === state.editingExpenseId);
      if (idx > -1) state.expenses[idx] = { id: state.editingExpenseId, date, amount, desc };
      showNotification('تم تحديث المصروف', 'success');
      state.editingExpenseId = null;
      expenseModal.querySelector('h3').textContent = 'إضافة مصروف';
      expenseModal.querySelector('button[type="submit"]').textContent = 'حفظ';
    } else {
      state.expenses.push({ id: Date.now(), date, amount, desc });
      if (recurringExp) state.fixedExpenses.push({ amount, desc });
      showNotification('تم إضافة المصروف', 'success');
    }
    saveState(); renderExpenses(); updateSummary();
    e.target.reset(); expenseModal.classList.add('hidden');
  });
  // Parser for Income modal
  document.getElementById('income-parse-btn').addEventListener('click', () => {
    const text = document.getElementById('income-parser').value;
    // استخراج التاريخ: ISO-format أو 'اليوم'
    let date = '';
    const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);
    if (dateMatch) {
      date = dateMatch[0];
    } else if (/اليوم/.test(text)) {
      date = new Date().toISOString().split('T')[0];
    }
    // استخراج المبلغ والوصف
    const amtMatch = text.match(/(\d+(?:\.\d+)?)/);
    const amount = amtMatch ? amtMatch[0] : '';
    let desc = text;
    // إزالة التاريخ وكلمة 'اليوم'
    if (date) desc = desc.replace(date, '').trim();
    desc = desc.replace(/اليوم/g, '').trim();
    // إزالة المبلغ
    if (amount) desc = desc.replace(amount, '').trim();
    document.getElementById('income-date').value = date;
    document.getElementById('income-amount').value = amount;
    document.getElementById('income-desc').value = desc;
  });
  // Parser for Expense modal
  document.getElementById('expense-parse-btn').addEventListener('click', () => {
    const text = document.getElementById('expense-parser').value;
    // استخراج التاريخ: ISO-format أو 'اليوم'
    let date = '';
    const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);
    if (dateMatch) {
      date = dateMatch[0];
    } else if (/اليوم/.test(text)) {
      date = new Date().toISOString().split('T')[0];
    }
    // استخراج المبلغ والوصف
    const amtMatch = text.match(/(\d+(?:\.\d+)?)/);
    const amount = amtMatch ? amtMatch[0] : '';
    let desc = text;
    // إزالة التاريخ وكلمة 'اليوم'
    if (date) desc = desc.replace(date, '').trim();
    desc = desc.replace(/اليوم/g, '').trim();
    // إزالة المبلغ
    if (amount) desc = desc.replace(amount, '').trim();
    document.getElementById('expense-date').value = date;
    document.getElementById('expense-amount').value = amount;
    document.getElementById('expense-desc').value = desc;
  });
  // Voice input support
  const incomeVoiceBtn = document.getElementById('income-voice-btn');
  const expenseVoiceBtn = document.getElementById('expense-voice-btn');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const recInc = new SpeechRecognition();
    recInc.lang = 'ar-SA';
    recInc.interimResults = false;
    incomeVoiceBtn.addEventListener('click', () => recInc.start());
    recInc.addEventListener('result', e => {
      document.getElementById('income-parser').value = e.results[0][0].transcript;
    });
    const recExp = new SpeechRecognition();
    recExp.lang = 'ar-SA';
    recExp.interimResults = false;
    expenseVoiceBtn.addEventListener('click', () => recExp.start());
    recExp.addEventListener('result', e => {
      document.getElementById('expense-parser').value = e.results[0][0].transcript;
    });
    // Search voice input support
    const incSearchVoiceBtn = document.getElementById('incomes-voice-btn');
    const expSearchVoiceBtn = document.getElementById('expenses-voice-btn');
    const recSearchInc = new SpeechRecognition();
    recSearchInc.lang = 'ar-SA';
    recSearchInc.interimResults = false;
    incSearchVoiceBtn.addEventListener('click', () => recSearchInc.start());
    recSearchInc.addEventListener('result', e => {
      const text = e.results[0][0].transcript;
      const incSearchInput = document.getElementById('incomes-search');
      incSearchInput.value = text;
      filterIncomes();
      const incClearBtn = document.getElementById('incomes-clear-btn');
      incClearBtn.style.display = 'block';
    });
    const recSearchExp = new SpeechRecognition();
    recSearchExp.lang = 'ar-SA';
    recSearchExp.interimResults = false;
    expSearchVoiceBtn.addEventListener('click', () => recSearchExp.start());
    recSearchExp.addEventListener('result', e => {
      const text = e.results[0][0].transcript;
      const expSearchInput = document.getElementById('expenses-search');
      expSearchInput.value = text;
      filterExpenses();
      const expClearBtn = document.getElementById('expenses-clear-btn');
      expClearBtn.style.display = 'block';
    });
  } else {
    console.warn('SpeechRecognition not supported');
  }
  document.getElementById('goal-form').addEventListener('submit', e => {
    e.preventDefault();
    setGoal();
  });
  document.getElementById('export-json').addEventListener('click', exportJSON);
  document.getElementById('export-excel').addEventListener('click', exportExcel);
  document.getElementById('export-pdf').addEventListener('click', exportPDF);
  document.getElementById('reset-data').addEventListener('click', resetData);

  // Import data functionality
  const importBtn = document.getElementById('import-data-btn');
  const importInput = document.getElementById('import-data-input');
  importBtn.addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const imported = JSON.parse(evt.target.result);
        state = imported;
        saveState();
        renderAll();
        showNotification('تم استيراد البيانات بنجاح', 'success');
      } catch {
        showNotification('فشل استيراد البيانات', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // Smart table search inputs with clear buttons
  const incSearchInput = document.getElementById('incomes-search');
  const expSearchInput = document.getElementById('expenses-search');
  const incClearBtn = document.getElementById('incomes-clear-btn');
  const expClearBtn = document.getElementById('expenses-clear-btn');
  incSearchInput.addEventListener('input', () => {
    filterIncomes();
    incClearBtn.style.display = incSearchInput.value.trim() ? 'block' : 'none';
  });
  expSearchInput.addEventListener('input', () => {
    filterExpenses();
    expClearBtn.style.display = expSearchInput.value.trim() ? 'block' : 'none';
  });
  incClearBtn.addEventListener('click', () => {
    incSearchInput.value = '';
    filterIncomes();
    incClearBtn.style.display = 'none';
    incSearchInput.focus();
  });
  expClearBtn.addEventListener('click', () => {
    expSearchInput.value = '';
    filterExpenses();
    expClearBtn.style.display = 'none';
    expSearchInput.focus();
  });

  initState();
  applyRecurring();
  renderAll();
  // Theme swatches selection
  const swatches = document.querySelectorAll('.theme-swatch');
  const themes = ['light','dark','blue','green','purple','red'];
  function applyTheme(theme) {
    document.body.classList.remove(...themes.filter(t => t !== 'light'));
    if (theme !== 'light') document.body.classList.add(theme);
    swatches.forEach(s => s.classList.toggle('selected', s.dataset.theme === theme));
  }
  // apply saved or default theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const theme = swatch.dataset.theme;
      applyTheme(theme);
      localStorage.setItem('theme', theme);
    });
  });
  // Currency swatches selection
  const currencySwatches = document.querySelectorAll('.currency-swatch');
  function applyCurrency(curr) {
    currencySwatches.forEach(s => s.classList.toggle('selected', s.dataset.currency === curr));
  }
  applyCurrency(state.currency);
  currencySwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      state.currency = swatch.dataset.currency;
      saveState();
      applyCurrency(state.currency);
      renderAll();
    });
  });
  // Cancel edit and close modals
  document.getElementById('income-cancel-btn').addEventListener('click', () => {
    state.editingIncomeId = null;
    document.getElementById('income-form').reset();
    document.getElementById('income-recurring').checked = false;
    const incomeModal = document.getElementById('income-modal');
    incomeModal.querySelector('h3').textContent = 'إضافة إيراد';
    incomeModal.querySelector('button[type="submit"]').textContent = 'حفظ';
    incomeModal.classList.add('hidden');
  });
  document.getElementById('expense-cancel-btn').addEventListener('click', () => {
    state.editingExpenseId = null;
    document.getElementById('expense-form').reset();
    document.getElementById('expense-recurring').checked = false;
    const expenseModal = document.getElementById('expense-modal');
    expenseModal.querySelector('h3').textContent = 'إضافة مصروف';
    expenseModal.querySelector('button[type="submit"]').textContent = 'حفظ';
    expenseModal.classList.add('hidden');
  });
});

// Notification system
function showNotification(message, type='info') {
  const container = document.getElementById('notification-container');
  if (!container) return;
  const notif = document.createElement('div');
  notif.classList.add('notification', type);
  notif.innerHTML = `<span class="message">${message}</span>`;
  container.appendChild(notif);
  // animate in
  setTimeout(() => notif.classList.add('show'), 10);
  // auto-hide with pause on hover
  let hideTimeout;
  function startHide() {
    hideTimeout = setTimeout(() => removeNotification(notif), 3000);
  }
  function clearHide() {
    clearTimeout(hideTimeout);
  }
  notif.addEventListener('mouseenter', clearHide);
  notif.addEventListener('mouseleave', startHide);
  startHide();
}

function removeNotification(notif) {
  notif.classList.remove('show');
  notif.classList.add('hide');
  notif.addEventListener('transitionend', () => notif.remove());
}

// Application state
let state = {
  incomes: [],
  expenses: [],
  goal: 0,
  fixedIncomes: [],
  fixedExpenses: [],
  lastMonth: null,
  currency: 'ر.س',
  editingIncomeId: null,
  editingExpenseId: null,
};

function initState() {
  const saved = JSON.parse(localStorage.getItem('financeState'));
  if (saved) state = saved;
  else {
    state.lastMonth = new Date().getMonth();
    saveState();
  }
}
function saveState() {
  localStorage.setItem('financeState', JSON.stringify(state));
}

// SPA page switch
function switchPage(pageId, linkEl) {
  document.querySelectorAll('.page-section').forEach(sec => {
    sec.classList.toggle('active-section', sec.id === pageId);
  });
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  if (linkEl) linkEl.classList.add('active');
}

function formatAmount(value) {
  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }
  return value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

// Render incomes table
function renderIncomes() {
  const tbody = document.getElementById('incomes-list');
  tbody.innerHTML = '';
  state.incomes.forEach(item => {
    const tr = document.createElement('tr');
    const amt = formatAmount(item.amount);
    tr.innerHTML = `
      <td>${item.date}</td>
      <td>${amt} ${state.currency}</td>
      <td>${item.desc}</td>
      <td>
        <button onclick="editIncome(${item.id})"><i class="fas fa-edit"></i></button>
        <button onclick="deleteIncome(${item.id})"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  // Apply current search filter
  filterIncomes();
}
// Render expenses table
function renderExpenses() {
  const tbody = document.getElementById('expenses-list');
  tbody.innerHTML = '';
  state.expenses.forEach(item => {
    const tr = document.createElement('tr');
    const amt = formatAmount(item.amount);
    tr.innerHTML = `
      <td>${item.date}</td>
      <td>${amt} ${state.currency}</td>
      <td>${item.desc}</td>
      <td>
        <button onclick="editExpense(${item.id})"><i class="fas fa-edit"></i></button>
        <button onclick="deleteExpense(${item.id})"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  // Apply current search filter
  filterExpenses();
}

// Delete functions
function deleteIncome(id) {
  state.incomes = state.incomes.filter(i => i.id !== id);
  saveState(); renderIncomes(); updateSummary();
  showNotification('تم حذف الإيراد', 'warning');
}
function deleteExpense(id) {
  state.expenses = state.expenses.filter(e => e.id !== id);
  saveState(); renderExpenses(); updateSummary();
  showNotification('تم حذف المصروف', 'warning');
}

// Edit functions
function editIncome(id) {
  const entry = state.incomes.find(i => i.id === id);
  if (!entry) return;
  state.editingIncomeId = id;
  document.getElementById('income-date').value = entry.date;
  document.getElementById('income-amount').value = entry.amount;
  document.getElementById('income-desc').value = entry.desc;
  const incomeModal = document.getElementById('income-modal');
  incomeModal.querySelector('h3').textContent = 'تعديل إيراد';
  incomeModal.querySelector('button[type="submit"]').textContent = 'تحديث';
  incomeModal.classList.remove('hidden');
}

function editExpense(id) {
  const entry = state.expenses.find(e => e.id === id);
  if (!entry) return;
  state.editingExpenseId = id;
  document.getElementById('expense-date').value = entry.date;
  document.getElementById('expense-amount').value = entry.amount;
  document.getElementById('expense-desc').value = entry.desc;
  const expenseModal = document.getElementById('expense-modal');
  expenseModal.querySelector('h3').textContent = 'تعديل مصروف';
  expenseModal.querySelector('button[type="submit"]').textContent = 'تحديث';
  expenseModal.classList.remove('hidden');
}

// Goal
function setGoal() {
  const val = parseFloat(document.getElementById('monthly-goal-input').value);
  if (isNaN(val)) return;
  state.goal = val;
  saveState(); renderGoal();
  showNotification('تم حفظ الهدف الشهري', 'success');
}
function renderGoal() {
  const goalValue = state.goal;
  document.getElementById('current-goal').textContent = `${formatAmount(goalValue)} ${state.currency}`;
  // حساب الرصيد (الإيرادات - المصروفات)
  const totalIn = state.incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalEx = state.expenses.reduce((sum, e) => sum + e.amount, 0);
  const bal = totalIn - totalEx;
  const balEl = document.getElementById('current-balance');
  if (balEl) balEl.textContent = `${formatAmount(bal)} ${state.currency}`;
  // حساب نسبة التقدم بناءً على الرصيد
  const percent = goalValue > 0 ? (bal / goalValue * 100) : 0;
  const clamped = Math.min(Math.max(percent, 0), 100);
  const percentEl = document.getElementById('goal-percent');
  if (percentEl) percentEl.textContent = `${clamped.toFixed(2)}%`;
  // تحديث شريط التقدم
  const progressEl = document.getElementById('goal-progress');
  if (progressEl) progressEl.style.width = `${clamped}%`;
}

// Summary (home page)
function updateSummary() {
  const totalIn = state.incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalEx = state.expenses.reduce((sum, e) => sum + e.amount, 0);
  const bal = totalIn - totalEx;
  const dayCount = new Date().getDate();
  document.getElementById('total-incomes').textContent = `${formatAmount(totalIn)} ${state.currency}`;
  document.getElementById('total-expenses').textContent = `${formatAmount(totalEx)} ${state.currency}`;
  document.getElementById('balance').textContent = `${formatAmount(bal)} ${state.currency}`;
  document.getElementById('avg-income').textContent = `${formatAmount(totalIn/dayCount)} ${state.currency}`;
  document.getElementById('avg-expense').textContent = `${formatAmount(totalEx/dayCount)} ${state.currency}`;
}

// Chart
let financeChart;
function renderChart() {
  const ctx = document.getElementById('finance-chart').getContext('2d');
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const labels = [...Array(daysInMonth).keys()].map(d => d+1);
  const incData = labels.map(day => {
    const date = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return state.incomes.filter(i=>i.date===date).reduce((sum,i)=>sum+i.amount,0);
  });
  const expData = labels.map(day => {
    const date = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return state.expenses.filter(e=>e.date===date).reduce((sum,e)=>sum+e.amount,0);
  });
  if (financeChart) financeChart.destroy();
  financeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'الإيرادات', data: incData, borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(), fill: false },
        { label: 'المصروفات', data: expData, borderColor: getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim(), fill: false }
      ]
    }
  });
}

// Exports
function exportJSON() {
  const blob = new Blob([JSON.stringify(state, null,2)],{type:'application/json'});
  saveAs(blob, `finance_backup_${Date.now()}.json`);
  showNotification('تم تصدير JSON بنجاح', 'success');
}
function exportExcel() {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(state.incomes), 'Incomes');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(state.expenses), 'Expenses');
  const wbout = XLSX.write(wb, {bookType:'xlsx', type:'array'});
  saveAs(new Blob([wbout],{type:'application/octet-stream'}), `finance_backup_${Date.now()}.xlsx`);
  showNotification('تم تصدير Excel بنجاح', 'success');
}
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const totalIn = state.incomes.reduce((sum,i)=>sum+i.amount,0);
  const totalEx = state.expenses.reduce((sum,e)=>sum+e.amount,0);
  const bal = totalIn - totalEx;
  const dayCount = new Date().getDate();
  doc.text('تقرير المالية',10,10);
  doc.text(`إجمالي الإيرادات: ${formatAmount(totalIn)} ${state.currency}`,10,20);
  doc.text(`إجمالي المصروفات: ${formatAmount(totalEx)} ${state.currency}`,10,30);
  doc.text(`الفرق: ${formatAmount(bal)} ${state.currency}`,10,40);
  doc.save(`finance_report_${Date.now()}.pdf`);
  showNotification('تم تصدير PDF بنجاح', 'success');
}

// Reset data
function resetData() {
  if (!confirm('هل تريد مسح جميع البيانات؟')) return;
  state.incomes=[]; state.expenses=[]; state.goal=0; state.fixedIncomes=[]; state.fixedExpenses=[];
  state.lastMonth = new Date().getMonth();
  saveState(); renderAll();
  showNotification('تم إعادة تعيين البيانات', 'info');
}

// Recurring items
function applyRecurring() {
  const currentMonth = new Date().getMonth();
  if (state.lastMonth!==currentMonth) {
    state.fixedIncomes.forEach(item => {
      state.incomes.push({ id: Date.now()+Math.random(), date:new Date().toISOString().split('T')[0], amount:item.amount, desc:item.desc });
    });
    state.fixedExpenses.forEach(item => {
      state.expenses.push({ id: Date.now()+Math.random(), date:new Date().toISOString().split('T')[0], amount:item.amount, desc:item.desc });
    });
    state.lastMonth = currentMonth;
    saveState();
    showNotification('تم تطبيق الدخل/التزام الشهري الثابت لهذا الشهر', 'info');
  }
}

// Render all
function renderAll() {
  renderIncomes();
  renderExpenses();
  renderGoal();
  updateSummary();
  renderChart();
}

/**
 * تصفية جدول الإيرادات بناءً على إدخال البحث
 */
function filterIncomes() {
  const term = document.getElementById('incomes-search').value.trim().toLowerCase();
  document.querySelectorAll('#incomes-list tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
  });
}
/**
 * تصفية جدول المصروفات بناءً على إدخال البحث
 */
function filterExpenses() {
  const term = document.getElementById('expenses-search').value.trim().toLowerCase();
  document.querySelectorAll('#expenses-list tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
  });
}
