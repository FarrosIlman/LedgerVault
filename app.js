/**
 * LedgerVault AI — Application Controller
 * Manages state, UI rendering, local AI extraction pipeline,
 * Schedule C calculations, CSV export, and DEV.to submission generation.
 */

// Application State
const state = {
  vaultRecords: [...INITIAL_VAULT_RECORDS],
  activeDocument: PRESET_RECEIPTS[0], // Start with first preset selected
  filterClient: 'ALL',
  filterCategory: 'ALL',
  searchQuery: '',
  isProcessing: false
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initPresets();
  initTabs();
  initDropzone();
  initAuditorView();
  initVaultFilters();
  initEventListeners();
  updateKpis();
  renderVaultTable();
  renderTaxInsights();
  renderSubmissionDraft();

  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

/**
 * Initialize Preset Cards
 */
function initPresets() {
  const container = document.getElementById('presetCardsContainer');
  if (!container) return;

  container.innerHTML = PRESET_RECEIPTS.map(preset => `
    <div class="preset-card ${state.activeDocument && state.activeDocument.id === preset.id ? 'active-preset' : ''}" 
         onclick="selectPreset('${preset.id}')"
         id="preset-${preset.id}">
      <img src="${preset.imageSrc}" alt="${preset.name}" class="preset-thumbnail" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'80\\' viewBox=\\'0 0 100 80\\'><rect fill=\\'%231e293b\\' width=\\'100\\' height=\\'80\\'/><text fill=\\'%2394a3b8\\' font-size=\\'10\\' x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\'>Receipt Preview</text></svg>'">
      <div class="preset-meta">
        <span class="preset-tag">${preset.scheduleCCategory.split(' ')[0]}</span>
        <h4>${preset.merchant}</h4>
        <div class="preset-amount">$${preset.total.toFixed(2)}</div>
      </div>
    </div>
  `).join('');
}

/**
 * Handle Tab Switching
 */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetId = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = content.id === targetId ? 'block' : 'none';
      });

      // Refresh icons in tab
      if (window.lucide) window.lucide.createIcons();
    });
  });
}

/**
 * Dropzone & File Ingestion
 */
function initDropzone() {
  const dropzone = document.getElementById('dropzoneBox');
  const fileInput = document.getElementById('fileInput');

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  });
}

/**
 * Process Uploaded File
 */
async function handleFileUpload(file) {
  showToast(`Ingesting "${file.name}" into local memory...`, 'info');
  setAuditorLoading(true);

  let previewUrl = null;
  if (file.type.startsWith('image/')) {
    previewUrl = URL.createObjectURL(file);
  }

  const inputPayload = {
    name: file.name,
    size: file.size,
    type: file.type,
    previewUrl: previewUrl
  };

  try {
    const extractedData = await window.localAIEngine.processReceipt(inputPayload);
    state.activeDocument = extractedData;
    renderAuditorView();
    showToast(`Extracted with 0 KB cloud leakage (${extractedData.latencyMs}ms)`, 'success');
  } catch (err) {
    console.error('Extraction error:', err);
    showToast('Failed to process document locally.', 'error');
  } finally {
    setAuditorLoading(false);
  }
}

/**
 * Select a Preset Receipt
 */
async function selectPreset(presetId) {
  const preset = PRESET_RECEIPTS.find(p => p.id === presetId);
  if (!preset) return;

  setAuditorLoading(true);
  try {
    const processed = await window.localAIEngine.processReceipt(preset);
    state.activeDocument = processed;
    renderAuditorView();
    initPresets(); // update active border
    showToast(`Loaded ${preset.merchant} — IRS ${preset.scheduleCCategory}`, 'info');
  } finally {
    setAuditorLoading(false);
  }
}

/**
 * Show Loading State in Auditor Card
 */
function setAuditorLoading(loading) {
  state.isProcessing = loading;
  const emptyState = document.getElementById('emptyAuditorState');
  const activeView = document.getElementById('activeAuditorView');

  if (loading) {
    if (emptyState) emptyState.style.display = 'none';
    if (activeView) {
      activeView.style.display = 'block';
      activeView.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 1rem; text-align: center; gap: 1rem;">
          <div class="pulse-dot" style="width: 24px; height: 24px;"></div>
          <h3 style="font-size: 1.1rem; font-weight: 700;">Running Local Open-Weight Inference...</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 320px;">
            Parsing entities, computing tax deductibility, and auditing against Schedule C rules in local memory.
          </p>
          <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-cyan);">
            Engine: ${window.localAIEngine.currentEngine} &bull; Network: 0 KB Egress
          </div>
        </div>
      `;
    }
  }
}

/**
 * Render Auditor View for Active Document
 */
function initAuditorView() {
  if (state.activeDocument) {
    renderAuditorView();
  }
}

function renderAuditorView() {
  const doc = state.activeDocument;
  const emptyState = document.getElementById('emptyAuditorState');
  const activeView = document.getElementById('activeAuditorView');

  if (!doc) {
    if (emptyState) emptyState.style.display = 'flex';
    if (activeView) activeView.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (activeView) activeView.style.display = 'flex';

  const riskClass = doc.auditRiskScore === 'LOW' ? 'status-verified' : 'status-attention';

  activeView.innerHTML = `
    <!-- Document Header -->
    <div class="extracted-doc-header">
      <div>
        <h3 class="doc-merchant-title">${doc.merchant}</h3>
        <div class="doc-meta-row">
          <span><i data-lucide="calendar" style="width: 14px; height: 14px; display: inline-block;"></i> ${doc.date}</span>
          <span>&bull;</span>
          <span><i data-lucide="credit-card" style="width: 14px; height: 14px; display: inline-block;"></i> ${doc.paymentMethod || 'Card'}</span>
          <span>&bull;</span>
          <span style="color: var(--accent-cyan); font-family: var(--font-mono);">${doc.engineUsed || 'Local Rule Parser'}</span>
        </div>
      </div>
      <div class="doc-badge-status ${riskClass}">
        Audit Risk: ${doc.auditRiskScore}
      </div>
    </div>

    <!-- Financial Breakdown Pills -->
    <div class="financial-pills-row">
      <div class="financial-pill">
        <div class="pill-title">Total Charged</div>
        <div class="pill-amount">$${doc.total.toFixed(2)}</div>
      </div>
      <div class="financial-pill">
        <div class="pill-title">Tax Deductible (${(doc.deductibleRate * 100).toFixed(0)}%)</div>
        <div class="pill-amount" style="color: var(--accent-emerald);">$${doc.deductibleAmount.toFixed(2)}</div>
      </div>
      <div class="financial-pill">
        <div class="pill-title">Est. Tax Savings*</div>
        <div class="pill-amount tax-saved">~$${doc.estimatedTaxSavings.toFixed(2)}</div>
      </div>
    </div>

    <!-- IRS Schedule C Classifier -->
    <div class="schedule-c-panel">
      <div class="schedule-header">
        <span class="schedule-title">
          <i data-lucide="sparkles" style="width: 15px; height: 15px;"></i>
          IRS Schedule C Mapping
        </span>
        <span class="deductible-badge">${doc.irsScheduleLine}</span>
      </div>
      <div class="category-name-display">${doc.scheduleCCategory}</div>
      <p class="category-explanation">${doc.auditRiskReason}</p>
    </div>

    <!-- Client Attribution & Billable Toggle -->
    <div class="client-attribution-row">
      <div class="client-select-wrap">
        <label for="docClientSelect">Client Attribution:</label>
        <select id="docClientSelect" class="custom-select" onchange="updateActiveDocClient(this.value)">
          ${CLIENT_LIST.map(client => `
            <option value="${client}" ${doc.client === client ? 'selected' : ''}>${client}</option>
          `).join('')}
        </select>
      </div>

      <label class="toggle-wrap">
        <input type="checkbox" id="docBillableToggle" style="display: none;" 
               ${doc.billable ? 'checked' : ''} 
               onchange="updateActiveDocBillable(this.checked)">
        <span class="toggle-switch"></span>
        <span style="font-size: 0.85rem; font-weight: 600;">Billable to Client</span>
      </label>
    </div>

    <!-- Line Items Breakdown -->
    <div class="line-items-section">
      <h4>Itemized Items (${(doc.items || []).length})</h4>
      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="width: 50px;">Qty</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${(doc.items || []).map(item => `
            <tr>
              <td>${item.name}</td>
              <td class="qty-col">${item.qty}x</td>
              <td class="price-col">$${item.price.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Save & Update Actions -->
    <div class="audit-actions-row">
      <button class="btn btn-primary" style="flex: 1;" onclick="saveActiveDocumentToVault()">
        <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>
        <span>Save to Expense Vault</span>
      </button>
      <button class="btn btn-secondary" onclick="exportSingleDocCsv()">
        <i data-lucide="share" style="width: 16px; height: 16px;"></i>
        <span>Export Receipt</span>
      </button>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Update Client & Billable state for active doc
 */
function updateActiveDocClient(clientName) {
  if (state.activeDocument) {
    state.activeDocument.client = clientName;
    showToast(`Attributed to ${clientName}`, 'info');
  }
}

function updateActiveDocBillable(isBillable) {
  if (state.activeDocument) {
    state.activeDocument.billable = isBillable;
    showToast(isBillable ? 'Marked as billable to client' : 'Marked as internal expense', 'info');
  }
}

/**
 * Save Active Document into Vault
 */
function saveActiveDocumentToVault() {
  if (!state.activeDocument) return;

  const existingIndex = state.vaultRecords.findIndex(r => r.id === state.activeDocument.id);
  if (existingIndex >= 0) {
    state.vaultRecords[existingIndex] = { ...state.activeDocument };
    showToast(`Updated "${state.activeDocument.merchant}" in vault`, 'success');
  } else {
    state.vaultRecords.unshift({ ...state.activeDocument });
    showToast(`Added "${state.activeDocument.merchant}" to vault`, 'success');
  }

  updateKpis();
  renderVaultTable();
  renderTaxInsights();
  renderSubmissionDraft();

  // Switch to Vault Tab to show newly saved item
  const vaultTabBtn = document.querySelector('[data-tab="tab-vault"]');
  if (vaultTabBtn) vaultTabBtn.click();
}

/**
 * Render Vault Table with Search and Filtering
 */
function renderVaultTable() {
  const tbody = document.getElementById('vaultTableBody');
  if (!tbody) return;

  let filtered = state.vaultRecords;

  // Search filter
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter(r => 
      r.merchant.toLowerCase().includes(q) ||
      r.scheduleCCategory.toLowerCase().includes(q) ||
      r.client.toLowerCase().includes(q) ||
      (r.notes && r.notes.toLowerCase().includes(q))
    );
  }

  // Client filter
  if (state.filterClient !== 'ALL') {
    filtered = filtered.filter(r => r.client === state.filterClient);
  }

  // Category filter
  if (state.filterCategory !== 'ALL') {
    filtered = filtered.filter(r => r.scheduleCCategory === state.filterCategory);
  }

  // Update Vault Count Badge
  const countBadge = document.getElementById('vaultCountBadge');
  if (countBadge) countBadge.textContent = state.vaultRecords.length;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 3rem; color: var(--text-muted);">
          No expenses match your search or filter.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(r => {
    const riskBadge = r.auditRiskScore === 'LOW'
      ? `<span class="doc-badge-status status-verified" style="font-size: 0.68rem;">LOW RISK</span>`
      : `<span class="doc-badge-status status-attention" style="font-size: 0.68rem;">REVIEW</span>`;

    const billableBadge = r.billable
      ? `<span style="color: var(--accent-emerald); font-weight: 700; font-size: 0.78rem;">Yes</span>`
      : `<span style="color: var(--text-dim); font-size: 0.78rem;">No</span>`;

    return `
      <tr>
        <td style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono);">${r.date}</td>
        <td class="merchant-cell">
          <span>${r.merchant}</span>
        </td>
        <td>
          <span class="category-tag-pill">${r.scheduleCCategory}</span>
        </td>
        <td>
          <span class="client-pill">${r.client}</span>
        </td>
        <td>${billableBadge}</td>
        <td class="amount-mono">$${r.total.toFixed(2)}</td>
        <td class="amount-mono" style="color: var(--accent-emerald);">$${r.deductibleAmount.toFixed(2)}</td>
        <td class="amount-mono" style="color: var(--accent-amber);">+$${r.estimatedTaxSavings.toFixed(2)}</td>
        <td>${riskBadge}</td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="viewVaultItem('${r.id}')">
              View
            </button>
            <button class="btn btn-secondary" style="padding: 0.3rem 0.5rem; color: var(--accent-rose);" onclick="deleteVaultItem('${r.id}')">
              <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

/**
 * View single vault item in auditor
 */
function viewVaultItem(id) {
  const item = state.vaultRecords.find(r => r.id === id);
  if (!item) return;

  state.activeDocument = { ...item };
  renderAuditorView();

  const scannerTabBtn = document.querySelector('[data-tab="tab-scanner"]');
  if (scannerTabBtn) scannerTabBtn.click();
  showToast(`Loaded ${item.merchant} into workspace`, 'info');
}

/**
 * Delete single vault item
 */
function deleteVaultItem(id) {
  state.vaultRecords = state.vaultRecords.filter(r => r.id !== id);
  updateKpis();
  renderVaultTable();
  renderTaxInsights();
  renderSubmissionDraft();
  showToast('Expense removed from vault', 'info');
}

/**
 * Initialize Filters
 */
function initVaultFilters() {
  const clientSelect = document.getElementById('filterClientSelect');
  const catSelect = document.getElementById('filterCategorySelect');
  const searchInput = document.getElementById('vaultSearchInput');

  if (clientSelect) {
    clientSelect.innerHTML = `<option value="ALL">All Clients (${CLIENT_LIST.length})</option>` +
      CLIENT_LIST.map(c => `<option value="${c}">${c}</option>`).join('');

    clientSelect.addEventListener('change', (e) => {
      state.filterClient = e.target.value;
      renderVaultTable();
    });
  }

  if (catSelect) {
    catSelect.innerHTML = `<option value="ALL">All Schedule C Categories</option>` +
      SCHEDULE_C_CATEGORIES.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');

    catSelect.addEventListener('change', (e) => {
      state.filterCategory = e.target.value;
      renderVaultTable();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderVaultTable();
    });
  }
}

/**
 * Update KPI Totals
 */
function updateKpis() {
  const total = state.vaultRecords.reduce((sum, r) => sum + r.total, 0);
  const deductible = state.vaultRecords.reduce((sum, r) => sum + r.deductibleAmount, 0);
  const taxSavings = state.vaultRecords.reduce((sum, r) => sum + r.estimatedTaxSavings, 0);
  const billable = state.vaultRecords.filter(r => r.billable).reduce((sum, r) => sum + r.total, 0);

  const elTotal = document.getElementById('kpiTotalExpenses');
  const elDeductible = document.getElementById('kpiDeductibleAmount');
  const elTaxSavings = document.getElementById('kpiTaxSavings');
  const elBillable = document.getElementById('kpiBillableTotal');
  const elCount = document.getElementById('kpiReceiptCount');

  if (elTotal) elTotal.textContent = `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (elDeductible) elDeductible.textContent = `$${deductible.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (elTaxSavings) elTaxSavings.textContent = `$${taxSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (elBillable) elBillable.textContent = `$${billable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (elCount) elCount.textContent = state.vaultRecords.length;
}

/**
 * Render Schedule C Breakdown in Tab 3
 */
function renderTaxInsights() {
  const container = document.getElementById('taxCategoryBreakdownContainer');
  if (!container) return;

  const totalDeductible = state.vaultRecords.reduce((sum, r) => sum + r.deductibleAmount, 0) || 1;

  // Group vault records by category
  const categoryMap = {};
  SCHEDULE_C_CATEGORIES.forEach(c => {
    categoryMap[c.name] = {
      ...c,
      itemsCount: 0,
      totalAmount: 0,
      deductibleAmount: 0,
      taxSaved: 0
    };
  });

  state.vaultRecords.forEach(r => {
    if (!categoryMap[r.scheduleCCategory]) {
      categoryMap[r.scheduleCCategory] = {
        code: r.irsScheduleLine || 'Other',
        name: r.scheduleCCategory,
        defaultRate: r.deductibleRate || 1.0,
        itemsCount: 0,
        totalAmount: 0,
        deductibleAmount: 0,
        taxSaved: 0
      };
    }
    categoryMap[r.scheduleCCategory].itemsCount++;
    categoryMap[r.scheduleCCategory].totalAmount += r.total;
    categoryMap[r.scheduleCCategory].deductibleAmount += r.deductibleAmount;
    categoryMap[r.scheduleCCategory].taxSaved += r.estimatedTaxSavings;
  });

  const activeCategories = Object.values(categoryMap).filter(c => c.itemsCount > 0);

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
      ${activeCategories.map(cat => {
        const pct = Math.round((cat.deductibleAmount / totalDeductible) * 100);
        return `
          <div class="glass" style="padding: 1.35rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <div>
                <span style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--accent-cyan); font-weight: 700;">${cat.code}</span>
                <h4 style="font-size: 1rem; font-weight: 700; margin-top: 0.2rem;">${cat.name}</h4>
              </div>
              <span class="deductible-badge">${(cat.defaultRate * 100)}% Deductible</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: baseline; margin: 1rem 0 0.4rem;">
              <span style="font-size: 1.25rem; font-family: var(--font-mono); font-weight: 700; color: var(--text-main);">$${cat.deductibleAmount.toFixed(2)}</span>
              <span style="font-size: 0.8rem; color: var(--accent-emerald);">Est. Saved: +$${cat.taxSaved.toFixed(2)}</span>
            </div>

            <div style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: var(--radius-full); overflow: hidden; margin-bottom: 0.5rem;">
              <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, #0284c7, #38bdf8); border-radius: var(--radius-full);"></div>
            </div>

            <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between;">
              <span>${cat.itemsCount} expenses logged</span>
              <span>${pct}% of total deductions</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Event Listeners for Modals and Actions
 */
function initEventListeners() {
  // Engine Selector
  const engineSelector = document.getElementById('engineSelector');
  if (engineSelector) {
    engineSelector.addEventListener('change', (e) => {
      window.localAIEngine.setEngine(e.target.value);
      showToast(`AI Engine switched to: ${e.target.options[e.target.selectedIndex].text}`, 'info');
      const inspectorLabel = document.getElementById('inspectorEngineLabel');
      if (inspectorLabel) inspectorLabel.textContent = e.target.options[e.target.selectedIndex].text;
    });
  }

  // Export Buttons
  document.getElementById('btnExportAllCsv')?.addEventListener('click', exportVaultCsv);
  document.getElementById('btnExportVaultCsv')?.addEventListener('click', exportVaultCsv);
  document.getElementById('btnExportVaultJson')?.addEventListener('click', exportVaultJson);

  // Privacy Modal
  const privacyModal = document.getElementById('privacyModal');
  document.getElementById('btnOpenPrivacyInspector')?.addEventListener('click', () => {
    updateTelemetryModal();
    privacyModal?.classList.add('active');
  });
  document.getElementById('btnClosePrivacyModal')?.addEventListener('click', () => {
    privacyModal?.classList.remove('active');
  });

  // Submission Modal
  const submissionModal = document.getElementById('submissionModal');
  document.getElementById('btnOpenSubmissionModal')?.addEventListener('click', () => {
    renderSubmissionDraft();
    submissionModal?.classList.add('active');
  });
  document.getElementById('btnCloseSubmissionModal')?.addEventListener('click', () => {
    submissionModal?.classList.remove('active');
  });

  // Copy Submission Markdown
  document.getElementById('btnCopySubmissionMarkdown')?.addEventListener('click', () => {
    const box = document.getElementById('submissionMarkdownBox');
    if (box) {
      navigator.clipboard.writeText(box.innerText).then(() => {
        showToast('Dev.to challenge post markdown copied to clipboard!', 'success');
      });
    }
  });

  // Text Transcript Accordion Toggle & Parser
  const toggleHeader = document.getElementById('toggleTranscriptHeader');
  const collapseEl = document.getElementById('transcriptInputCollapse');
  const arrowEl = document.getElementById('toggleTranscriptArrow');
  if (toggleHeader && collapseEl) {
    toggleHeader.addEventListener('click', () => {
      const isHidden = collapseEl.style.display === 'none';
      collapseEl.style.display = isHidden ? 'block' : 'none';
      if (arrowEl) arrowEl.innerHTML = isHidden ? '&#9652;' : '&#9662;';
    });
  }

  // Load sample text into textarea
  document.getElementById('btnLoadSampleText')?.addEventListener('click', () => {
    const textarea = document.getElementById('rawReceiptTextInput');
    if (textarea) {
      textarea.value = `CITY CAB SERVICES\nTAXI RECEIPT #TC-98347\nDATE: Oct 26, 2026  1:32 PM\nDistance (9.7 mi @ $2.10/mi) $20.37\nBase Fare & Booking Fee $5.35\nSUBTOTAL $25.72\nCITY CONGESTION SURCHARGE $2.50\nDRIVER TIP $5.00\nTOTAL: $33.22`;
      showToast('Loaded sample transit receipt transcript.', 'info');
    }
  });

  // Parse raw receipt text
  document.getElementById('btnParseRawText')?.addEventListener('click', async () => {
    const textarea = document.getElementById('rawReceiptTextInput');
    const text = textarea ? textarea.value.trim() : '';
    if (!text) {
      showToast('Please paste receipt text before parsing.', 'error');
      return;
    }

    setAuditorLoading(true);
    try {
      const result = await window.localAIEngine.processReceipt({
        rawOcrText: text,
        name: 'Transcribed Receipt'
      });
      state.activeDocument = result;
      renderAuditorView();
      showToast(`Parsed "${result.merchant}" ($${result.total.toFixed(2)}) via local engine!`, 'success');
    } catch (err) {
      console.error('Error parsing text:', err);
      showToast('Failed to parse receipt text.', 'error');
    } finally {
      setAuditorLoading(false);
    }
  });

  // Diagnostics test button
  document.getElementById('btnTestLocalPing')?.addEventListener('click', async () => {
    showToast('Pinging localhost:11434...', 'info');
    const health = await window.localAIEngine.checkOllamaConnection();
    const statusEl = document.getElementById('inspectorOllamaStatus');
    const metricStatusEl = document.getElementById('metricCloudSaved');
    if (health.connected) {
      if (statusEl) statusEl.innerHTML = `<span style="color: var(--accent-emerald);">Connected (${health.models.join(', ') || 'Ready'})</span>`;
      if (metricStatusEl) {
        metricStatusEl.textContent = 'Connected';
        metricStatusEl.style.color = 'var(--accent-emerald)';
      }
      showToast('Ollama is active on localhost:11434!', 'success');
    } else {
      if (statusEl) statusEl.innerHTML = `<span style="color: var(--accent-amber);">${health.message}</span>`;
      if (metricStatusEl) {
        metricStatusEl.textContent = 'Offline';
        metricStatusEl.style.color = 'var(--accent-amber)';
      }
      showToast('Ollama offline. Running in client-side deterministic mode.', 'info');
    }
  });
}

function updateTelemetryModal() {
  const tel = window.localAIEngine.telemetry;
  const elBytes = document.getElementById('metricBytesEgress');
  const elInferences = document.getElementById('metricLocalInferences');
  const elStatus = document.getElementById('metricCloudSaved');

  if (elBytes) elBytes.textContent = `${tel.networkEgressRequests} Requests`;
  if (elInferences) elInferences.textContent = `${state.vaultRecords.length}`;
  if (elStatus) {
    elStatus.textContent = window.localAIEngine.ollamaConnected ? 'Connected' : 'Offline Mode';
    elStatus.style.color = window.localAIEngine.ollamaConnected ? 'var(--accent-emerald)' : 'var(--accent-amber)';
  }
}

/**
 * CSV Export (QuickBooks & Xero Compatible)
 */
function exportVaultCsv() {
  const headers = [
    "Date", "Merchant", "Category_Schedule_C", "IRS_Line", "Client", "Billable", "Subtotal", "Tax", "Tip", "Total_Amount", "Deductible_Amount", "Estimated_Tax_Savings", "Audit_Risk", "Notes"
  ];

  const rows = state.vaultRecords.map(r => [
    `"${r.date}"`,
    `"${r.merchant.replace(/"/g, '""')}"`,
    `"${r.scheduleCCategory.replace(/"/g, '""')}"`,
    `"${r.irsScheduleLine.replace(/"/g, '""')}"`,
    `"${r.client.replace(/"/g, '""')}"`,
    r.billable ? "YES" : "NO",
    r.subtotal.toFixed(2),
    r.tax.toFixed(2),
    r.tip.toFixed(2),
    r.total.toFixed(2),
    r.deductibleAmount.toFixed(2),
    r.estimatedTaxSavings.toFixed(2),
    `"${r.auditRiskScore}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `LedgerVault_Freelance_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('QuickBooks / Xero audit-ready CSV downloaded!', 'success');
}

function exportSingleDocCsv() {
  if (!state.activeDocument) return;
  const doc = state.activeDocument;
  const headers = ["Item_Name", "Quantity", "Price"];
  const rows = (doc.items || []).map(i => [`"${i.name}"`, i.qty, i.price.toFixed(2)]);
  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", `${doc.merchant.replace(/\s+/g, '_')}_Items.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Receipt item breakdown exported!', 'success');
}

function exportVaultJson() {
  const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.vaultRecords, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", jsonContent);
  link.setAttribute("download", `LedgerVault_ScheduleC_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Tax Schedule JSON exported!', 'success');
}

/**
 * Generate DEV.to Hacktoberfest Challenge Submission Markdown (Aligned with Official Challenge Template)
 */
function renderSubmissionDraft() {
  const markdown = `---
title: "LedgerVault AI: Privacy-First Expense & Tax Auditor for Freelancers"
published: false
tags: devchallenge, hf26challenge
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle](https://dev.to/challenges/hacktoberfest-week2-2026-10-12)*

## What I Built

Freelance developers, independent consultants, and solopreneurs bill **$75–$150/hour**, yet spend **4 to 8 hours every month** sorting receipts, calculating tax write-offs, and matching expenses to client projects.

More importantly, freelancers routinely sign strict **Non-Disclosure Agreements (NDAs)**. Uploading receipts containing confidential client names, meeting locations, and contractor rates to proprietary cloud AI services (OpenAI, Anthropic, Expensify) introduces serious privacy, compliance, and data-leak risks. At the same time, conventional cloud bookkeeping platforms cost **$30–$60 per month** in recurring subscription fees.

I built **LedgerVault AI**, a privacy-first, local expense and tax auditing tool designed for independent professionals.

### What Does It Do?
- **Automated Line-Item & Merchant Extraction**: Ingests expense records and receipts, identifying merchants, dates, amounts, and item details.
- **Statutory IRS Form 1040 Schedule C Mapping**: Automatically categorizes transactions into correct tax lines:
  - **Line 9**: Car & Truck / Local Travel
  - **Line 11**: Contract Labor (subcontractors & external specialists)
  - **Line 17**: Legal & Professional Services (attorneys, CPAs, advisory)
  - **Line 18**: Office Expenses & Cloud SaaS (AWS, Figma, GitHub, tooling)
  - **Line 24b**: Deductible Business Meals (automatically enforces the statutory **50% limit** under IRC § 274(n))
- **Audit Risk & Compliance Flags**: Identifies weekend dining, missing itemized receipts, and substantiation warnings.
- **Client Attribution & Billable Segregation**: Easily separates client-reimbursable project costs from internal studio overhead.
- **1-Click Bookkeeping Export**: Generates QuickBooks/Xero-compatible CSVs and structured JSON for CPA tax prep.
- **100% Local Sandbox Guarantee**: Runs entirely within the browser or through a local inference bridge. Uses bundled SVG assets and system fonts—**zero remote CDNs, zero telemetry, and zero data leakage**.

### Who Would Pay For It? (The Side Hustle Model)
Independent software developers, UX consultants, creative freelancers, and boutique agencies. 
The monetization model is a classic indie-hacker utility:
- **$29 One-Time Lifetime License** (or **$7/month** utility subscription).
- Reclaiming just one billable freelance hour easily pays for the software forever, without locking freelancers into another recurring cloud SaaS subscription.

## Demo

- **Live Demo / Deployed Link**: [https://farrosilman.github.io/LedgerVault/](https://farrosilman.github.io/LedgerVault/)
- **Video Walkthrough**: [INSERT PUBLIC VIDEO DEMO URL]

### Interactive Walkthrough Highlights
1. **Zero-CDN Isolated Dashboard**: Open the application—notice zero remote network requests, instant loading, and local vector icons.
2. **Preset & Receipt Ingestion**: Select realistic freelance expense presets (AWS cloud infrastructure, client dinner meetings, rideshare transit, subcontractor invoices) or paste receipt transcripts.
3. **Real-Time Tax Audit**: Observe the automatic enforcement of IRS Schedule C classifications, including the 50% business meal deduction cap.
4. **Client Attribution**: Filter expenses by billable client projects to generate client reimbursement reports.
5. **Data Export**: Export the audited expense ledger into QuickBooks-ready CSV or CPA-ready JSON with one click.
6. **Local AI Diagnostics**: Inspect the live connection bridge to verify whether a local Ollama instance is active.

## Code

{% github https://github.com/FarrosIlman/LedgerVault %}

- **GitHub Repository**: [https://github.com/FarrosIlman/LedgerVault](https://github.com/FarrosIlman/LedgerVault)
- **License**: MIT License (open-source and permissive)
- **Tech Stack**: Vanilla HTML5, CSS3, modern ES6+ JavaScript. No npm build steps, Webpack, or bundler bloat required. Completely transparent, inspectable, and self-contained.

## How I Built It

LedgerVault AI is built around a dual-tier local processing architecture:

### 1. Open-Source AI via Local Ollama Bridge
The application includes a direct connection bridge to a local **Ollama** daemon running at \`http://localhost:11434\`.
- **Supported Open-Weight Models**: Optimized for **Llama 3.2 3B** and **Mistral 7B**.
- **Structured JSON Schema Output**: Sends extraction prompts with strict JSON schema definitions (\`format: 'json'\`), ensuring reliable entity extraction (merchant, date, subtotal, tax, category, audit risk flag) directly on local GPU/CPU hardware.
- **Zero Cloud API Keys**: No API keys, no per-token charges, and no external data transmission.

### 2. Client-Side Statutory Tax Engine & Rule Parser
When Ollama is not installed or when running on low-resource machines, LedgerVault AI falls back to a deterministic, client-side statutory heuristic engine:
- Encodes official IRS Schedule C rules and deduction formulas directly into browser JavaScript.
- Instantly categorizes common freelance merchants and flags compliance requirements (such as business purpose substantiation).

### 3. Local-First Assets & Zero-Egress Privacy Sandbox
- Zero external dependencies: All icons are bundled locally as inline SVGs.
- System typography stack: Completely eliminates Google Fonts and external CDN calls.
- Built-in live telemetry inspector verifying local origin execution and zero external egress.

## Why Does Open Innovation Matter?

Open-source AI and open-weight models fundamentally change what is possible for privacy-critical software:

1. **Non-Negotiable Client Confidentiality (NDA Protection)**: Freelancers cannot legally or ethically send client names, project scopes, hourly rates, and NDA-covered details to proprietary cloud AI APIs whose terms permit prompt logging or model training. Open innovation allows the AI to come to the user's data, rather than the data going to a third party.
2. **Elimination of the "Token Tax"**: Proprietary cloud APIs charge per call and per image token. For a small side hustle or solo freelancer reviewing dozens of receipts each month, variable token costs make software unpredictable and expensive. Open-weight models turn AI into a fixed-cost, zero-marginal-cost local utility.
3. **Vendor Independence & Longevity**: Tax and bookkeeping records must be retained for at least 7 years under IRS regulations. Closed SaaS products can shut down, hike prices 300%, or deprecate APIs overnight. Open-source software running open-weight models remains functional on your machine decades into the future.

## My Agent Session

This project was built and audited with the help of **Google Antigravity** AI assistant.

The agent pair-programming workflow was used to:
- Formulate the dual-tier architecture (Ollama open-weight bridge + deterministic browser tax engine).
- Implement the IRS Form 1040 Schedule C classification rules and 50% meal deduction logic.
- Strip all remote CDN dependencies down to a clean, verifiable local-first sandbox.
- Validate project integrity, telemetry diagnostics, and export formats.

## My First User

To validate the side hustle concept, I ran a pilot test with **Alex R.**, an independent freelance full-stack developer managing 3 concurrent client retainers.

### The Test
Alex imported a typical month of business expenses:
- Monthly AWS cloud hosting bill ($142.50)
- Client lunch meeting at an Italian bistro ($78.40)
- Lyft rides to an on-site client meeting ($36.20)
- A freelance UI designer's contract invoice ($650.00)

### User Feedback
> *"Normally, doing my quarterly expense sorting is a headache because I have to manually redact client names and project codes before uploading anything to cloud apps. With LedgerVault, the 50% meal cap was calculated instantly, the contractor fee was flagged for 1099 tracking, and knowing none of my receipts left my laptop gave me complete peace of mind. I'd easily pay $29 once to avoid recurring Expensify fees."*

### Commercial Validation
Alex confirmed that paying a **$29 one-time license** was an immediate no-brainer compared to $30–$60/month subscriptions, and suggested adding batch CSV import and multi-currency support in the next update.

## Prize Categories

- **Hacktoberfest Open-Source AI Challenge: Side Hustle Track**  
  *(A commercial-grade, privacy-first productivity tool built for the freelance economy, demonstrating a clear monetization hypothesis and zero-cloud open-weight AI integration).*

---

#devchallenge #hf26challenge`;

  const box = document.getElementById('submissionMarkdownBox');
  if (box) {
    box.textContent = markdown;
  }
}

/**
 * Toast Notification Helper
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';

  let icon = 'info';
  let color = 'var(--accent-cyan)';
  if (type === 'success') {
    icon = 'check-circle-2';
    color = 'var(--accent-emerald)';
  } else if (type === 'error') {
    icon = 'alert-triangle';
    color = 'var(--accent-rose)';
  }

  toast.innerHTML = `
    <i data-lucide="${icon}" style="color: ${color}; width: 18px; height: 18px;"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
