// 数据初始化
let staffData = JSON.parse(localStorage.getItem('staffData')) || [
    { id: 1, name: "阳阳", position: "美容师", commission: 3 },
    { id: 2, name: "董董", position: "理疗师", commission: 3 },
    { id: 3, name: "莉莉", position: "美容师", commission: 3 },
    { id: 4, name: "梦梦", position: "理疗师", commission: 3 }
];

let projectTypes = JSON.parse(localStorage.getItem('projectTypes')) || [
    "基础身体", "仪器", "药拓", "艾灸", "年卡", "特色"
];

let projectsData = JSON.parse(localStorage.getItem('projectsData')) || [
    { id: 1, name: "面部护理", type: "基础身体", manualFee: 15.00 },
    { id: 2, name: "面部拨筋", type: "仪器", manualFee: 20.00 },
    { id: 3, name: "艾灸肚子", type: "艾灸", manualFee: 10.00 },
    { id: 4, name: "全身推拿", type: "基础身体", manualFee: 30.00 },
    { id: 5, name: "药拓护理", type: "药拓", manualFee: 25.00 }
];

const arrivalChannels = ["会员", "抖音", "美团", "现场散客", "转介绍"];

// 在全局变量部分添加金额类型常量
const amountTypes = [
    { value: "", label: "请选择金额类型（可选）" },
    { value: "单次消费", label: "单次消费" },
    { value: "购卡", label: "购卡" },
    { value: "购卡消费", label: "购卡消费" }
];

let yearBusinessData = JSON.parse(localStorage.getItem('yearBusinessData')) || {
};




for (let i = 1; i <= 12; i++) {
    if (!yearBusinessData[i]) yearBusinessData[i] = [];
}

let importedData = [];
let currentMonth = new Date().getMonth() + 1;
let currentPage = 1;
const pageSize = 10;
let searchKeyword = '';
// 在全局变量部分添加
let selectedProjectsInModal = [];
let salesBeauticiansInModal = [];

// 在全局变量部分添加
let projectAllocationsInModal = {}; // 保存每个项目的分配信息
// 主初始化函数
document.addEventListener('DOMContentLoaded', function() {
    fixExistingData();
    updateMonthView(currentMonth);
    renderStaffList();
    renderProjectTypes();
    renderProjectList();
    initCharts();
    bindAllEvents();
    rebindMonthButtons();
    
    // 金额类型变化时更新界面
    document.getElementById('recordAmountType').addEventListener('change', function() {
        updateRecordFormLayout();
    });
    
    // 金额变化时更新销售美容师部分
    document.getElementById('recordAmount').addEventListener('input', function() {
        updateSalesBeauticianSection();
    });
    
    // 添加销售美容师按钮事件
    document.getElementById('addSalesBeauticianBtn').addEventListener('click', function() {
        addSalesBeautician();
    });
    
    // 强制更新一次图表数据
    setTimeout(() => {
        updateCharts();
        updateCustomerRanking();
    }, 500);
});

// 添加更新表单布局的函数
function updateRecordFormLayout() {
    const amountType = document.getElementById('recordAmountType').value;
    const amountInputSection = document.getElementById('amountInputSection');
    const projectSection = document.getElementById('projectSection');
    const beauticianAllocationSection = document.getElementById('beauticianAllocationSection');
    const salesBeauticianSection = document.getElementById('salesBeauticianSection');
    
    // 重置所有部分
    document.getElementById('recordAmount').value = '';
    amountInputSection.classList.add('hidden');
    projectSection.classList.add('hidden');
    beauticianAllocationSection.classList.add('hidden');
    salesBeauticianSection.classList.add('hidden');
    
    // 清空之前的选择
    selectedProjectsInModal = [];
    salesBeauticiansInModal = [];
    projectAllocationsInModal = {};
    document.getElementById('selectedProjects').innerHTML = '';
    document.getElementById('beauticianAllocationList').innerHTML = '';
    document.getElementById('salesBeauticianList').innerHTML = '';
    document.getElementById('salesSummary').classList.add('hidden');
    
    // 根据金额类型显示相应部分
    if (amountType) {
        amountInputSection.classList.remove('hidden');
        
        switch(amountType) {
            case '单次消费':
                // 显示项目选择和手工费分配
                projectSection.classList.remove('hidden');
                beauticianAllocationSection.classList.remove('hidden');
                // 不显示销售美容师
                salesBeauticianSection.classList.add('hidden');
                break;
                
            case '购卡':
                // 不显示项目选择和手工费分配
                projectSection.classList.add('hidden');
                beauticianAllocationSection.classList.add('hidden');
                // 显示销售美容师
                salesBeauticianSection.classList.remove('hidden');
                break;
                
            case '购卡消费':
                // 显示所有部分
                projectSection.classList.remove('hidden');
                beauticianAllocationSection.classList.remove('hidden');
                salesBeauticianSection.classList.remove('hidden');
                break;
        }
    } else {
        // 修改这里：金额类型未选择时，默认显示项目选择和手工费分配
        projectSection.classList.remove('hidden');
        beauticianAllocationSection.classList.remove('hidden');
        // 不显示金额输入和销售美容师
        amountInputSection.classList.add('hidden');
        salesBeauticianSection.classList.add('hidden');
    }
}
function rebindMonthButtons() {
    document.querySelectorAll('.month-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });
    
    document.querySelectorAll('.month-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const month = parseInt(this.dataset.month);
            if (month !== currentMonth) {
                updateMonthView(month);
                showNotification('success', `已切换到${month}月份数据`);
            }
        });
    });
}

function bindAllEvents() {
    document.getElementById('addRowBtn').addEventListener('click', function() {
        openRecordModal(-1);
    });
    
    document.getElementById('projectBtn').addEventListener('click', function() {
        openProjectModal();
    });
    
    bindRecordFormEvents();
    bindPaginationEvents();
    bindSearchEvent();
    bindStaffManagementEvents();
    bindProjectManagementEvents();
    bindSaveDataButton();
    bindImportExportEvents();
}

function bindProjectManagementEvents() {
    const projectModal = document.getElementById('projectModal');
    const closeProjectModal = document.getElementById('closeProjectModal');
    const importProjectBtn = document.getElementById('importProjectBtn');
    const exportProjectBtn = document.getElementById('exportProjectBtn');
    const projectForm = document.getElementById('projectForm');
    const cancelProjectBtn = document.getElementById('cancelProjectBtn');
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    const addTypeBtn = document.getElementById('addTypeBtn');
    const newTypeInput = document.getElementById('newTypeInput');
    
    document.getElementById('projectBtn').addEventListener('click', function() {
        projectModal.classList.remove('hidden');
        renderProjectList();
        renderProjectTypes();
    });
    
    closeProjectModal.addEventListener('click', function() {
        projectModal.classList.add('hidden');
        projectForm.reset();
        document.getElementById('projectIndex').value = '-1';
        document.getElementById('projectFormTitle').textContent = '添加新项目';
    });
    
    importProjectBtn.addEventListener('click', function() {
        openImportProjectModal();
    });
    
    exportProjectBtn.addEventListener('click', function() {
        exportProjects();
    });
    
    cancelProjectBtn.addEventListener('click', function() {
        projectForm.reset();
        document.getElementById('projectIndex').value = '-1';
        document.getElementById('projectFormTitle').textContent = '添加新项目';
    });
    
    projectForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProject();
    });
    
    addTypeBtn.addEventListener('click', function() {
        const newType = newTypeInput.value.trim();
        if (newType) {
            if (!projectTypes.includes(newType)) {
                projectTypes.push(newType);
                saveProjectTypes();
                renderProjectTypes();
                newTypeInput.value = '';
                showNotification('success', '项目类型添加成功');
            } else {
                showNotification('info', '该类型已存在');
            }
        }
    });
}

function bindProjectImportEvents() {
    const importProjectModal = document.getElementById('importProjectModal');
    const closeImportProjectModal = document.getElementById('closeImportProjectModal');
    const projectDropArea = document.getElementById('projectDropArea');
    const projectFileInput = document.getElementById('projectFileInput');
    
    closeImportProjectModal.addEventListener('click', function() {
        importProjectModal.classList.add('hidden');
        resetProjectImportModal();
    });
    
    projectDropArea.addEventListener('click', function() {
        projectFileInput.click();
    });
    
    projectFileInput.addEventListener('change', function(e) {
        if (e.target.files.length) {
            handleProjectFileUpload(e.target.files[0]);
        }
    });
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        projectDropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        projectDropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        projectDropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        projectDropArea.classList.add('border-primary', 'bg-primary/5');
    }
    
    function unhighlight() {
        projectDropArea.classList.remove('border-primary', 'bg-primary/5');
    }
    
    projectDropArea.addEventListener('drop', handleProjectDrop, false);
    
    function handleProjectDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file) {
            handleProjectFileUpload(file);
        }
    }
}

function openImportProjectModal() {
    const importProjectModal = document.getElementById('importProjectModal');
    importProjectModal.classList.remove('hidden');
    resetProjectImportModal();
}

function handleProjectFileUpload(file) {
    if (!file.name.endsWith('.csv')) {
        showNotification('error', '请上传CSV格式的文件');
        return;
    }
    
    const reader = new FileReader();
    const projectImportProgress = document.getElementById('projectImportProgress');
    const projectProgressBar = document.getElementById('projectProgressBar');
    const projectImportStatus = document.getElementById('projectImportStatus');
    
    projectImportProgress.classList.remove('hidden');
    projectProgressBar.style.width = '30%';
    projectImportStatus.textContent = '正在解析文件...';
    
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const lines = content.split('\n');
            if (lines.length < 2) throw new Error('文件内容为空或格式不正确');
            
            const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
            const importedProjects = [];
            
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                const values = lines[i].split(',').map(val => val.trim());
                const row = {};
                
                headers.forEach((header, index) => {
                    if (header.includes('项目名称')) row.name = values[index];
                    else if (header.includes('项目类型')) row.type = values[index];
                    else if (header.includes('手工费')) row.manualFee = values[index];
                });
                
                importedProjects.push(row);
            }
            
            projectProgressBar.style.width = '80%';
            projectImportStatus.textContent = `解析完成，共发现 ${importedProjects.length} 个项目`;
            importProjectsData(importedProjects);
            
        } catch (error) {
            showNotification('error', `解析文件失败：${error.message}`);
            resetProjectImportModal();
        }
    };
    
    reader.onerror = function() {
        showNotification('error', '读取文件失败');
        resetProjectImportModal();
    };
    
    reader.readAsText(file);
}

function importProjectsData(importedProjects) {
    const projectProgressBar = document.getElementById('projectProgressBar');
    const projectImportStatus = document.getElementById('projectImportStatus');
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    importedProjects.forEach((row, index) => {
        try {
            if (!row.name) throw new Error('项目名称不能为空');
            if (!row.type) throw new Error('项目类型不能为空');
            
            const manualFee = parseFloat(row.manualFee);
            if (isNaN(manualFee) || manualFee < 0) throw new Error(`无效的手工费: ${row.manualFee}`);
            
            const existingIndex = projectsData.findIndex(p => p.name === row.name);
            
            if (!projectTypes.includes(row.type)) projectTypes.push(row.type);
            
            if (existingIndex === -1) {
                projectsData.push({
                    id: Date.now() + index,
                    name: row.name,
                    type: row.type,
                    manualFee: manualFee
                });
            } else {
                projectsData[existingIndex].type = row.type;
                projectsData[existingIndex].manualFee = manualFee;
            }
            
            successCount++;
            
        } catch (error) {
            errorCount++;
            errors.push(`第 ${index + 1} 行: ${error.message}`);
        }
    });
    
    projectProgressBar.style.width = '100%';
    projectImportStatus.textContent = `导入完成：成功 ${successCount} 个，失败 ${errorCount} 个`;
    
    saveProjectsData();
    saveProjectTypes();
    renderProjectList();
    renderProjectTypes();
    
    if (errorCount > 0) {
        showNotification('info', `项目导入完成，成功 ${successCount} 个，失败 ${errorCount} 个`);
    } else {
        showNotification('success', `成功导入 ${successCount} 个项目`);
    }
    
    setTimeout(() => {
        document.getElementById('importProjectModal').classList.add('hidden');
        resetProjectImportModal();
    }, 1500);
}

function resetProjectImportModal() {
    document.getElementById('projectFileInput').value = '';
    document.getElementById('projectImportProgress').classList.add('hidden');
    document.getElementById('projectProgressBar').style.width = '0%';
    document.getElementById('projectImportStatus').textContent = '准备导入...';
}

function exportProjects() {
    if (projectsData.length === 0) {
        showNotification('info', '没有可导出的项目数据');
        return;
    }
    
    let csvContent = "项目名称,项目类型,手工费\n";
    projectsData.forEach(project => {
        const row = [
            `"${project.name.replace(/"/g, '""')}"`,
            `"${project.type.replace(/"/g, '""')}"`,
            project.manualFee.toFixed(2)
        ];
        csvContent += row.join(',') + "\n";
    });
    
    downloadCSV(csvContent, `项目数据_${new Date().toISOString().slice(0,10)}.csv`);
}

function renderProjectList() {
    const projectListEl = document.getElementById('projectList');
    projectListEl.innerHTML = '';
    
    if (projectsData.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="4" class="px-4 py-8 text-center text-gray-500">暂无项目数据</td>`;
        projectListEl.appendChild(emptyRow);
    } else {
        projectsData.forEach((project, index) => {
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-gray-50';
            row.innerHTML = `
                <td class="px-4 py-2">${project.name}</td>
                <td class="px-4 py-2">${project.type}</td>
                <td class="px-4 py-2">¥${project.manualFee.toFixed(2)}</td>
                <td class="px-4 py-2">
                    <div class="flex space-x-2">
                        <button class="edit-project text-primary hover:text-primary/80" data-index="${index}">
                            <i class="fa fa-pencil"></i>
                        </button>
                        <button class="delete-project text-red-500 hover:text-red-700" data-index="${index}">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            projectListEl.appendChild(row);
        });
        
        document.querySelectorAll('.edit-project').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                editProject(index);
            });
        });
        
        document.querySelectorAll('.delete-project').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                deleteProject(index);
            });
        });
    }
}

function renderProjectTypes() {
    const projectTypeSelect = document.getElementById('projectType');
    const projectTypesList = document.getElementById('projectTypesList');
    
    projectTypeSelect.innerHTML = '<option value="">请选择项目类型</option>';
    projectTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        projectTypeSelect.appendChild(option);
    });
    
    projectTypesList.innerHTML = '';
    projectTypes.forEach(type => {
        const tag = document.createElement('div');
        tag.className = 'inline-flex items-center bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm';
        tag.innerHTML = `
            ${type}
            <button class="ml-1 text-red-500 hover:text-red-700 delete-type" data-type="${type}">
                <i class="fa fa-times text-xs"></i>
            </button>
        `;
        projectTypesList.appendChild(tag);
    });
    
    document.querySelectorAll('.delete-type').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.type;
            deleteProjectType(type);
        });
    });
}

function editProject(index) {
    const project = projectsData[index];
    if (project) {
        document.getElementById('projectIndex').value = index;
        document.getElementById('projectFormTitle').textContent = '编辑项目';
        document.getElementById('projectName').value = project.name;
        document.getElementById('projectType').value = project.type;
        document.getElementById('projectManualFee').value = project.manualFee;
    }
}

function deleteProject(index) {
    if (confirm('确定要删除该项目吗？')) {
        projectsData.splice(index, 1);
        saveProjectsData();
        renderProjectList();
        showNotification('success', '项目已删除');
    }
}

function saveProject() {
    const index = parseInt(document.getElementById('projectIndex').value);
    const name = document.getElementById('projectName').value.trim();
    const type = document.getElementById('projectType').value;
    const manualFee = parseFloat(document.getElementById('projectManualFee').value);
    
    if (!name || !type || isNaN(manualFee)) {
        showNotification('error', '请填写所有必填字段');
        return;
    }
    
    if (index === -1) {
        projectsData.push({
            id: Date.now(),
            name: name,
            type: type,
            manualFee: manualFee
        });
        showNotification('success', '项目添加成功');
    } else {
        projectsData[index].name = name;
        projectsData[index].type = type;
        projectsData[index].manualFee = manualFee;
        showNotification('success', '项目更新成功');
    }
    
    saveProjectsData();
    document.getElementById('projectForm').reset();
    document.getElementById('projectIndex').value = '-1';
    document.getElementById('projectFormTitle').textContent = '添加新项目';
    renderProjectList();
}

function deleteProjectType(type) {
    const projectsUsingType = projectsData.filter(p => p.type === type);
    
    if (projectsUsingType.length > 0) {
        showNotification('error', `该类型被 ${projectsUsingType.length} 个项目使用，无法删除`);
        return;
    }
    
    if (confirm(`确定要删除项目类型 "${type}" 吗？`)) {
        projectTypes = projectTypes.filter(t => t !== type);
        saveProjectTypes();
        renderProjectTypes();
        showNotification('success', '项目类型已删除');
    }
}

function saveProjectTypes() {
    localStorage.setItem('projectTypes', JSON.stringify(projectTypes));
}

function saveProjectsData() {
    localStorage.setItem('projectsData', JSON.stringify(projectsData));
}

function bindRecordFormEvents() {
    document.getElementById('closeRecordModal').addEventListener('click', closeRecordModal);
    document.getElementById('cancelRecordBtn').addEventListener('click', closeRecordModal);
    
    const amountTypeSelect = document.getElementById('recordAmountType');
    amountTypeSelect.addEventListener('change', function() {
        updateRecordFormLayout();
    });
    
    const projectSearch = document.getElementById('projectSearch');
    projectSearch.addEventListener('input', function() {
        renderProjectOptions(this.value);
    });
    
    document.getElementById('showAllProjects').addEventListener('click', function() {
        document.getElementById('projectSearch').value = '';
        renderProjectOptions('');
    });
    
    document.getElementById('recordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveRecord();
    });
    
    // 金额输入变化时更新计算
    document.getElementById('recordAmount').addEventListener('input', function() {
        updateSalesBeauticianSection();
    });
}
function renderProjectOptions(searchKeyword = '') {
    const projectSelection = document.getElementById('projectSelection');
    projectSelection.innerHTML = '';
    
    const filteredProjects = projectsData.filter(project => 
        project.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        project.type.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    
    if (filteredProjects.length === 0) {
        projectSelection.innerHTML = '<div class="text-center text-gray-500 py-4">没有找到匹配的项目</div>';
        return;
    }
    
    const projectsByType = {};
    filteredProjects.forEach(project => {
        if (!projectsByType[project.type]) projectsByType[project.type] = [];
        projectsByType[project.type].push(project);
    });
    
    for (const type in projectsByType) {
        const typeGroup = document.createElement('div');
        typeGroup.className = 'mb-3';
        typeGroup.innerHTML = `<h5 class="font-medium text-gray-700 mb-1">${type}</h5>`;
        
        const projectsContainer = document.createElement('div');
        projectsContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-2';
        
        projectsByType[type].forEach(project => {
            const isSelected = selectedProjectsInModal.some(p => p.id === project.id);
            const projectBtn = document.createElement('button');
            projectBtn.type = 'button';
            projectBtn.className = `text-left p-2 border rounded hover:bg-gray-50 ${isSelected ? 'bg-primary/10 border-primary' : ''}`;
            projectBtn.innerHTML = `
                <div class="font-medium">${project.name}</div>
                <div class="text-sm text-gray-500">手工费: ¥${project.manualFee.toFixed(2)}</div>
            `;
            projectBtn.addEventListener('click', function() {
                toggleProjectSelection(project);
            });
            projectsContainer.appendChild(projectBtn);
        });
        
        typeGroup.appendChild(projectsContainer);
        projectSelection.appendChild(typeGroup);
    }
}

function toggleProjectSelection(project) {
    const index = selectedProjectsInModal.findIndex(p => p.id === project.id);
    
    if (index === -1) {
        selectedProjectsInModal.push({
            id: project.id,
            name: project.name,
            type: project.type,
            manualFee: project.manualFee
        });
    } else {
        selectedProjectsInModal.splice(index, 1);
        clearProjectAllocation(project.id);
    }
    
    renderSelectedProjects();
    renderProjectOptions(document.getElementById('projectSearch').value);
    updateBeauticianAllocationSection();
}

function renderSelectedProjects() {
    const selectedProjectsEl = document.getElementById('selectedProjects');
    selectedProjectsEl.innerHTML = '';
    
    if (selectedProjectsInModal.length === 0) return;
    
    selectedProjectsInModal.forEach(project => {
        const projectTag = document.createElement('span');
        projectTag.className = 'selected-project';
        projectTag.innerHTML = `
            ${project.name}
            <button type="button" class="ml-1 text-white hover:text-gray-200" onclick="removeSelectedProject(${project.id})">
                <i class="fa fa-times"></i>
            </button>
        `;
        selectedProjectsEl.appendChild(projectTag);
    });
}

// 修改 removeSelectedProject 函数
window.removeSelectedProject = function(projectId) {
    const index = selectedProjectsInModal.findIndex(p => p.id === projectId);
    if (index !== -1) {
        // 先保存当前分配状态
        saveProjectAllocations(projectId);
        
        selectedProjectsInModal.splice(index, 1);
        renderSelectedProjects();
        renderProjectOptions(document.getElementById('projectSearch').value);
        updateBeauticianAllocationSection();
        clearProjectAllocation(projectId);
    }
};

function clearProjectAllocation(projectId) {
    const allocationList = document.getElementById('beauticianAllocationList');
    const allocations = allocationList.querySelectorAll(`[data-project-id="${projectId}"]`);
    allocations.forEach(allocation => allocation.remove());
    updateTotalManualFee();
}

// 修改 updateBeauticianAllocationSection 函数
function updateBeauticianAllocationSection() {
    const allocationSection = document.getElementById('beauticianAllocationSection');
    const allocationList = document.getElementById('beauticianAllocationList');
    
    // 只有当选择了项目时才显示美容师分配部分
    if (selectedProjectsInModal.length === 0) {
        allocationSection.classList.add('hidden');
        allocationList.innerHTML = '';
        return;
    }
    
    allocationSection.classList.remove('hidden');
    
    // 不清除现有内容，而是检查需要添加的新项目
    const existingProjectIds = new Set(
        Array.from(allocationList.querySelectorAll('.project-allocation-card'))
            .map(card => card.id.replace('project-card-', ''))
    );
    
    // 为每个新选择的项目创建卡片
    selectedProjectsInModal.forEach((project, index) => {
        if (!existingProjectIds.has(project.id.toString())) {
            // 创建项目分配卡片
            const projectCard = createProjectCard(project);
            
            // 插入到合适的位置
            if (index === 0) {
                allocationList.prepend(projectCard);
            } else {
                // 找到正确的位置插入
                const projectsBefore = selectedProjectsInModal.slice(0, index);
                let insertPosition = null;
                
                for (let i = index - 1; i >= 0; i--) {
                    const prevCard = document.getElementById(`project-card-${projectsBefore[i].id}`);
                    if (prevCard) {
                        insertPosition = prevCard.nextElementSibling;
                        break;
                    }
                }
                
                if (insertPosition) {
                    allocationList.insertBefore(projectCard, insertPosition);
                } else {
                    allocationList.appendChild(projectCard);
                }
            }
            
            // 如果之前保存了分配信息，恢复它
            if (projectAllocationsInModal[project.id] && projectAllocationsInModal[project.id].length > 0) {
                setTimeout(() => {
                    restoreProjectAllocations(project.id, project.manualFee);
                }, 100);
            } else {
                // 否则添加一个默认的美容师
                setTimeout(() => {
                    addBeauticianToProject(project.id, project.manualFee);
                }, 100);
            }
        }
    });
    
    // 移除已取消选择的项目
    const currentProjectIds = new Set(selectedProjectsInModal.map(p => p.id.toString()));
    Array.from(allocationList.querySelectorAll('.project-allocation-card')).forEach(card => {
        const projectId = card.id.replace('project-card-', '');
        if (!currentProjectIds.has(projectId)) {
            card.remove();
        }
    });
    
    // 更新汇总统计
    updateAllocationSummary();
}
// 添加恢复分配信息的函数
function restoreProjectAllocations(projectId, projectManualFee) {
    const allocations = projectAllocationsInModal[projectId] || [];
    const beauticianList = document.getElementById(`beautician-list-${projectId}`);
    
    if (!beauticianList) return;
    
    // 清空现有内容
    beauticianList.innerHTML = '';
    
    // 恢复每个分配
    allocations.forEach((allocation, index) => {
        setTimeout(() => {
            createBeauticianForProjectWithData(projectId, projectManualFee, allocation);
        }, index * 50);
    });
}
// 修改保存分配信息的函数
function saveProjectAllocations(projectId) {
    const beauticianList = document.getElementById(`beautician-list-${projectId}`);
    if (!beauticianList) return;
    
    const allocations = [];
    const beauticianItems = beauticianList.querySelectorAll('.beautician-select');
    
    beauticianItems.forEach(select => {
        if (select.value) {
            const itemDiv = select.closest('.beautician-assign-item');
            const manualFeeInput = itemDiv.querySelector('.manual-fee-input');
            const manualPercentInput = itemDiv.querySelector('.manual-percent-input');
            
            allocations.push({
                beautician: select.value,
                manualFee: parseFloat(manualFeeInput.value) || 0,
                percent: parseFloat(manualPercentInput.value) || 0,
                beauticianId: itemDiv.dataset.beauticianId
            });
        }
    });
    
    projectAllocationsInModal[projectId] = allocations;
}

// 创建项目分配卡片
function createProjectCard(project) {
    const projectDiv = document.createElement('div');
    projectDiv.className = 'project-allocation-card';
    projectDiv.id = `project-card-${project.id}`;
    
    projectDiv.innerHTML = `
        <div class="project-header bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-4">
            <div class="flex justify-between items-center mb-3">
                <div class="flex items-center">
                    <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                        <i class="fa fa-tag text-primary"></i>
                    </div>
                    <div>
                        <h4 class="font-medium text-lg text-gray-800">${project.name}</h4>
                        <div class="flex items-center text-sm text-gray-500 mt-1">
                            <span class="px-2 py-1 bg-gray-100 rounded-full mr-2">${project.type}</span>
                            <i class="fa fa-money mr-1"></i>
                            <span>项目手工费: <span class="font-bold text-primary">¥${project.manualFee.toFixed(2)}</span></span>
                        </div>
                    </div>
                </div>
                <button type="button" 
                        class="add-beautician-btn text-sm bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg btn-hover flex items-center"
                        data-project-id="${project.id}" data-manual-fee="${project.manualFee}">
                    <i class="fa fa-user-plus mr-2"></i>添加美容师
                </button>
            </div>
            
            <!-- 美容师列表 -->
            <div id="beautician-list-${project.id}" class="mt-4 space-y-3"></div>
            
            <!-- 项目分配统计 -->
            <div class="mt-4 bg-gray-50 border border-gray-100 rounded-lg p-3">
                <div class="flex justify-between items-center text-sm">
                    <div class="flex items-center">
                        <i class="fa fa-check-circle text-blue-600 mr-2"></i>
                        <span class="text-gray-600">已分配:</span>
                        <span id="assigned-manual-fee-${project.id}" class="font-bold text-blue-700 ml-1">¥0.00</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fa fa-hourglass-half text-gray-500 mr-2"></i>
                        <span class="text-gray-600">剩余:</span>
                        <span id="remaining-fee-${project.id}" class="font-bold ml-1">¥${project.manualFee.toFixed(2)}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fa fa-calculator text-green-600 mr-2"></i>
                        <span class="text-gray-600">项目总额:</span>
                        <span class="font-bold text-green-700 ml-1">¥${project.manualFee.toFixed(2)}</span>
                    </div>
                </div>
                <div id="project-warning-${project.id}" class="mt-2 text-xs text-red-500 hidden">
                    <i class="fa fa-exclamation-triangle mr-1"></i>
                    <span>分配金额已超过项目手工费</span>
                </div>
            </div>
        </div>
    `;
    
    // 为添加按钮绑定事件
    const addButton = projectDiv.querySelector('.add-beautician-btn');
    addButton.addEventListener('click', function() {
        addBeauticianToProject(project.id, project.manualFee);
    });
    
    return projectDiv;
}

// 修改 createProjectAllocation 函数
function createProjectAllocation(project) {
    const allocationList = document.getElementById('beauticianAllocationList');
    
    // 创建项目卡片
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card mb-4';
    projectCard.innerHTML = `
        <div class="project-header bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div class="flex justify-between items-center mb-3">
                <div class="flex items-center">
                    <i class="fa fa-tag text-primary mr-2"></i>
                    <h4 class="font-medium text-primary">${project.name}</h4>
                    <span class="ml-3 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">${project.type}</span>
                </div>
                <div class="text-right">
                    <div class="text-sm text-gray-500">项目手工费</div>
                    <div class="text-xl font-bold text-primary">¥${project.manualFee.toFixed(2)}</div>
                </div>
            </div>
            
            <div class="mb-4">
                <div class="flex justify-between items-center">
                    <h5 class="text-sm font-medium text-gray-700 flex items-center">
                        <i class="fa fa-user-md mr-2 text-secondary"></i>
                        服务美容师分配
                    </h5>
                    <button type="button" 
                            class="add-beautician-btn text-sm bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded-lg btn-hover flex items-center"
                            data-project-id="${project.id}" data-manual-fee="${project.manualFee}">
                        <i class="fa fa-user-plus mr-1"></i>添加美容师
                    </button>
                </div>
                
                <!-- 美容师列表容器 -->
                <div id="beautician-list-${project.id}" class="mt-3 space-y-3"></div>
            </div>
            
            <!-- 项目分配统计 -->
            <div class="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <div class="flex justify-between items-center text-sm">
                    <div class="text-blue-700">
                        <i class="fa fa-check-circle mr-1"></i>
                        已分配: <span class="font-medium ml-1" id="assigned-manual-fee-${project.id}">¥0.00</span>
                    </div>
                    <div class="text-gray-600">
                        <i class="fa fa-hourglass-half mr-1"></i>
                        剩余: <span class="font-medium ml-1" id="remaining-fee-${project.id}">¥${project.manualFee.toFixed(2)}</span>
                    </div>
                    <div class="text-green-600">
                        <i class="fa fa-money mr-1"></i>
                        项目总额: <span class="font-medium ml-1">¥${project.manualFee.toFixed(2)}</span>
                    </div>
                </div>
                <div id="project-warning-${project.id}" class="text-xs text-red-500 mt-2 hidden">
                    <i class="fa fa-exclamation-triangle mr-1"></i>
                    <span>分配金额超过项目手工费</span>
                </div>
            </div>
        </div>
    `;
    
    allocationList.appendChild(projectCard);
    
    // 为添加按钮绑定事件
    const addButton = projectCard.querySelector('.add-beautician-btn');
    addButton.addEventListener('click', function() {
        addBeauticianToProject(project.id, project.manualFee);
    });
    
    // 自动为每个项目添加一个美容师
    setTimeout(() => {
        addBeauticianToProject(project.id, project.manualFee);
    }, 100);
    
    // 更新汇总统计
    updateAllocationSummary();
}

// 修改 addBeauticianToProject 函数
function addBeauticianToProject(projectId, projectManualFee) {
    const beauticianList = document.getElementById(`beautician-list-${projectId}`);
    
    if (!beauticianList) {
        // 如果元素不存在，重新创建项目卡片
        const project = selectedProjectsInModal.find(p => p.id === projectId);
        if (!project) return;
        
        // 重新创建项目卡片
        const projectCard = createProjectCard(project);
        const allocationList = document.getElementById('beauticianAllocationList');
        const existingCard = document.getElementById(`project-card-${projectId}`);
        
        if (existingCard) {
            allocationList.replaceChild(projectCard, existingCard);
        }
        
        // 递归调用
        setTimeout(() => addBeauticianToProject(projectId, projectManualFee), 100);
        return;
    }
    
    const existingBeauticians = Array.from(beauticianList.querySelectorAll('.beautician-select')).map(select => select.value);
    
    // 获取可用的美容师
    const availableBeauticians = staffData.filter(s => 
        (s.position === '美容师' || s.position === '理疗师') && 
        !existingBeauticians.includes(s.name)
    );
    
    if (availableBeauticians.length === 0) {
        showNotification('info', '没有可用的美容师了');
        return;
    }
    
    // 计算已分配的手工费
    let allocatedFee = 0;
    const existingItems = beauticianList.querySelectorAll('.beautician-assign-item');
    existingItems.forEach(item => {
        const feeInput = item.querySelector('.manual-fee-input');
        const fee = parseFloat(feeInput.value) || 0;
        allocatedFee += fee;
    });
    
    // 计算剩余可分配金额
    const remainingFee = projectManualFee - allocatedFee;
    if (remainingFee <= 0) {
        showNotification('info', '该项目手工费已全部分配完毕');
        return;
    }
    
    // 为新美容师计算默认分配金额（不要重新分配已有美容师的金额）
    // 只分配剩余金额给新美容师
    const defaultFee = Math.min(remainingFee, projectManualFee / 3).toFixed(2); // 不超过剩余金额，最多分1/3
    
    const beauticianId = Date.now() + Math.random();
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'beautician-assign-item bg-white border border-gray-200 rounded-lg p-4 mb-3';
    itemDiv.dataset.beauticianId = beauticianId;
    itemDiv.dataset.projectId = projectId;
    
    itemDiv.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <div class="flex items-center">
                <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <i class="fa fa-user text-primary text-sm"></i>
                </div>
                <div>
                    <select class="beautician-select form-input text-sm w-48" required>
                        <option value="">请选择美容师</option>
                        ${availableBeauticians.map(s => `<option value="${s.name}">${s.name} (${s.position})</option>`).join('')}
                    </select>
                    <div class="text-xs text-gray-500 mt-1">
                        项目: ${selectedProjectsInModal.find(p => p.id === projectId)?.name || '未知项目'}
                    </div>
                </div>
            </div>
            <button type="button" 
                    class="remove-beautician text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    onclick="removeBeauticianFromProject(${projectId}, ${projectManualFee}, '${beauticianId}')"
                    title="删除">
                <i class="fa fa-times"></i>
            </button>
        </div>
        
        <div class="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <div class="flex items-center mb-2">
                <i class="fa fa-hand-paper-o text-blue-600 mr-2"></i>
                <span class="text-sm font-medium text-blue-700">手工费分配</span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label class="text-xs text-gray-500 mb-1 block">分配金额 (元)</label>
                    <div class="relative">
                        <input type="number" step="0.01" min="0" max="${projectManualFee}" 
                               class="manual-fee-input form-input text-center font-medium text-blue-700" 
                               value="${defaultFee}"
                               onchange="updateProjectAllocation(${projectId}, ${projectManualFee}, '${beauticianId}')">
                        <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">元</span>
                    </div>
                    <div class="text-xs text-blue-600 mt-1 text-center">
                        当前: <span class="font-medium manual-fee-display">¥${defaultFee}</span>
                    </div>
                </div>
                
                <div>
                    <label class="text-xs text-gray-500 mb-1 block">分配比例</label>
                    <div class="relative">
                        <input type="number" step="1" min="0" max="100" 
                               class="manual-percent-input form-input text-center font-medium text-green-700" 
                               value="${Math.round((defaultFee / projectManualFee) * 100)}"
                               onchange="updateProjectAllocation(${projectId}, ${projectManualFee}, '${beauticianId}', 'percent')">
                        <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                    <div class="text-xs text-green-600 mt-1 text-center">
                        占项目: <span class="font-medium manual-percent-display">${Math.round((defaultFee / projectManualFee) * 100)}%</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    beauticianList.appendChild(itemDiv);
    
    // 绑定事件
    const select = itemDiv.querySelector('.beautician-select');
    const manualFeeInput = itemDiv.querySelector('.manual-fee-input');
    const manualPercentInput = itemDiv.querySelector('.manual-percent-input');
    const manualFeeDisplay = itemDiv.querySelector('.manual-fee-display');
    const manualPercentDisplay = itemDiv.querySelector('.manual-percent-display');
    
    // 设置初始显示
    updateBeauticianDisplay(manualFeeInput, manualPercentInput, manualFeeDisplay, manualPercentDisplay, projectManualFee);
    
    // 事件监听
    select.addEventListener('change', function() {
        if (this.value) {
            updateBeauticianDisplay(manualFeeInput, manualPercentInput, manualFeeDisplay, manualPercentDisplay, projectManualFee);
        }
    });
    
    manualFeeInput.addEventListener('input', function() {
        const fee = parseFloat(this.value) || 0;
        if (fee < 0) this.value = 0;
        if (fee > projectManualFee) this.value = projectManualFee.toFixed(2);
        
        updateBeauticianDisplay(manualFeeInput, manualPercentInput, manualFeeDisplay, manualPercentDisplay, projectManualFee);
        updateProjectAllocation(projectId, projectManualFee, beauticianId);
    });
    
    manualPercentInput.addEventListener('input', function() {
        const percent = parseFloat(this.value) || 0;
        let adjustedPercent = Math.max(0, Math.min(100, percent));
        const fee = (projectManualFee * adjustedPercent / 100).toFixed(2);
        
        manualFeeInput.value = fee;
        this.value = adjustedPercent;
        
        updateBeauticianDisplay(manualFeeInput, manualPercentInput, manualFeeDisplay, manualPercentDisplay, projectManualFee);
        updateProjectAllocation(projectId, projectManualFee, beauticianId, 'percent');
    });
    
    // 默认选择第一个可用的美容师
    if (availableBeauticians.length > 0) {
        select.value = availableBeauticians[0].name;
    }
    
    // 不要重新分配！只检查分配状态
    checkProjectAllocationStatus(projectId, projectManualFee);
    updateAllocationSummary();
    
    // 保存当前分配状态
    setTimeout(() => {
        saveProjectAllocations(projectId);
    }, 50);
}

// 更新美容师显示
function updateBeauticianDisplay(feeInput, percentInput, feeDisplay, percentDisplay, projectManualFee) {
    const fee = parseFloat(feeInput.value) || 0;
    const percent = Math.round((fee / projectManualFee) * 100);
    
    if (feeDisplay) feeDisplay.textContent = `¥${fee.toFixed(2)}`;
    if (percentDisplay) percentDisplay.textContent = `${percent}%`;
    if (percentInput) percentInput.value = percent;
}

// 更新项目分配
function updateProjectAllocation(projectId, projectManualFee, beauticianId, source = 'amount') {
    const item = document.querySelector(`[data-beautician-id="${beauticianId}"][data-project-id="${projectId}"]`);
    if (!item) return;
    
    const manualFeeInput = item.querySelector('.manual-fee-input');
    const manualPercentInput = item.querySelector('.manual-percent-input');
    const manualFeeDisplay = item.querySelector('.manual-fee-display');
    const manualPercentDisplay = item.querySelector('.manual-percent-display');
    
    updateBeauticianDisplay(manualFeeInput, manualPercentInput, manualFeeDisplay, manualPercentDisplay, projectManualFee);
    
    // 检查项目分配状态
    checkProjectAllocationStatus(projectId, projectManualFee);
    updateAllocationSummary();
}

// 重新分配项目手工费
function redistributeProjectAllocation(projectId, projectManualFee) {
    const beauticianList = document.getElementById(`beautician-list-${projectId}`);
    if (!beauticianList) return;
    
    const existingItems = beauticianList.querySelectorAll('.beautician-assign-item');
    const count = existingItems.length;
    
    if (count === 0) {
        updateProjectAllocationStatus(projectId, projectManualFee, 0);
        return;
    }
    
    let totalAllocated = 0;
    existingItems.forEach(item => {
        const feeInput = item.querySelector('.manual-fee-input');
        const fee = parseFloat(feeInput.value) || 0;
        totalAllocated += fee;
    });
    
    const remainingFee = projectManualFee - totalAllocated;
    
    // 如果还有剩余金额，重新平均分配
    if (remainingFee > 0) {
        const avgFee = (remainingFee / count).toFixed(2);
        
        existingItems.forEach(item => {
            const feeInput = item.querySelector('.manual-fee-input');
            const currentFee = parseFloat(feeInput.value) || 0;
            feeInput.value = (parseFloat(currentFee) + parseFloat(avgFee)).toFixed(2);
            
            // 更新显示
            const manualPercentInput = item.querySelector('.manual-percent-input');
            const manualFeeDisplay = item.querySelector('.manual-fee-display');
            const manualPercentDisplay = item.querySelector('.manual-percent-display');
            
            updateBeauticianDisplay(feeInput, manualPercentInput, manualFeeDisplay, manualPercentDisplay, projectManualFee);
        });
    }
    
    checkProjectAllocationStatus(projectId, projectManualFee);
}

// 检查项目分配状态
function checkProjectAllocationStatus(projectId, projectManualFee) {
    const beauticianList = document.getElementById(`beautician-list-${projectId}`);
    if (!beauticianList) return;
    
    const existingItems = beauticianList.querySelectorAll('.beautician-assign-item');
    
    let totalAllocated = 0;
    existingItems.forEach(item => {
        const feeInput = item.querySelector('.manual-fee-input');
        totalAllocated += parseFloat(feeInput.value) || 0;
    });
    
    updateProjectAllocationStatus(projectId, projectManualFee, totalAllocated);
}

// 更新项目分配状态显示
function updateProjectAllocationStatus(projectId, projectManualFee, allocatedFee) {
    const assignedFeeEl = document.getElementById(`assigned-manual-fee-${projectId}`);
    const remainingFeeEl = document.getElementById(`remaining-fee-${projectId}`);
    const warningEl = document.getElementById(`project-warning-${projectId}`);
    
    if (!assignedFeeEl || !remainingFeeEl) return;
    
    const allocated = allocatedFee.toFixed(2);
    const remaining = (projectManualFee - allocatedFee).toFixed(2);
    
    assignedFeeEl.textContent = `¥${allocated}`;
    remainingFeeEl.textContent = `¥${remaining}`;
    
    // 设置颜色状态
    if (remaining == 0) {
        remainingFeeEl.className = 'font-bold ml-1 text-green-600';
    } else if (remaining > 0) {
        remainingFeeEl.className = 'font-bold ml-1 text-blue-600';
    } else {
        remainingFeeEl.className = 'font-bold ml-1 text-red-600';
    }
    
    // 显示/隐藏警告
    if (allocatedFee > projectManualFee) {
        if (warningEl) warningEl.classList.remove('hidden');
    } else {
        if (warningEl) warningEl.classList.add('hidden');
    }
}
// 移除美容师
function removeBeauticianFromProject(projectId, projectManualFee, beauticianId) {
    const item = document.querySelector(`[data-beautician-id="${beauticianId}"]`);
    if (item) {
        item.remove();
        
        // 不要重新分配，只检查状态
        checkProjectAllocationStatus(projectId, projectManualFee);
        updateAllocationSummary();
        
        // 保存当前分配状态
        setTimeout(() => {
            saveProjectAllocations(projectId);
        }, 50);
    }
}

// 添加新的函数来创建带有数据的分配项
function createBeauticianForProjectWithData(projectId, projectManualFee, allocation) {
    const beauticianList = document.getElementById(`beautician-list-${projectId}`);
    if (!beauticianList) return;
    
    // 获取可用的美容师
    const existingBeauticians = Array.from(beauticianList.querySelectorAll('.beautician-select')).map(select => select.value);
    const availableBeauticians = staffData.filter(s => 
        (s.position === '美容师' || s.position === '理疗师') && 
        !existingBeauticians.includes(s.name)
    );
    
    const beauticianId = allocation.beauticianId || Date.now() + Math.random();
    
    // 检查指定的美容师是否可用
    const specifiedBeautician = staffData.find(s => s.name === allocation.beautician);
    let isBeauticianAvailable = false;
    if (specifiedBeautician && !existingBeauticians.includes(specifiedBeautician.name)) {
        isBeauticianAvailable = true;
    }
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'beautician-assign-item bg-white border border-gray-200 rounded-lg p-4 mb-3';
    itemDiv.dataset.beauticianId = beauticianId;
    itemDiv.dataset.projectId = projectId;
    
    // 准备选项
    let optionsHTML = '<option value="">请选择美容师</option>';
    if (isBeauticianAvailable) {
        optionsHTML += `<option value="${specifiedBeautician.name}" selected>${specifiedBeautician.name} (${specifiedBeautician.position})</option>`;
    }
    optionsHTML += availableBeauticians.map(s => 
        `<option value="${s.name}">${s.name} (${s.position})</option>`
    ).join('');
    
    itemDiv.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <div class="flex items-center">
                <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <i class="fa fa-user text-primary text-sm"></i>
                </div>
                <select class="beautician-select form-input text-sm w-48" required>
                    ${optionsHTML}
                </select>
            </div>
            <button type="button" 
                    class="remove-beautician text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    onclick="removeBeauticianFromProject(${projectId}, ${projectManualFee}, '${beauticianId}')"
                    title="删除">
                <i class="fa fa-times"></i>
            </button>
        </div>
        
        <div class="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <div class="flex items-center mb-2">
                <i class="fa fa-hand-paper-o text-blue-600 mr-2"></i>
                <span class="text-sm font-medium text-blue-700">手工费分配</span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label class="text-xs text-gray-500 mb-1 block">分配金额 (元)</label>
                    <div class="relative">
                        <input type="number" step="0.01" min="0" max="${projectManualFee}" 
                               class="manual-fee-input form-input text-center font-medium text-blue-700" 
                               value="${allocation.manualFee.toFixed(2)}"
                               onchange="updateProjectAllocation(${projectId}, ${projectManualFee}, '${beauticianId}')">
                        <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">元</span>
                    </div>
                    <div class="text-xs text-blue-600 mt-1 text-center">
                        当前: <span class="font-medium manual-fee-display">¥${allocation.manualFee.toFixed(2)}</span>
                    </div>
                </div>
                
                <div>
                    <label class="text-xs text-gray-500 mb-1 block">分配比例</label>
                    <div class="relative">
                        <input type="number" step="1" min="0" max="100" 
                               class="manual-percent-input form-input text-center font-medium text-green-700" 
                               value="${allocation.percent}"
                               onchange="updateProjectAllocation(${projectId}, ${projectManualFee}, '${beauticianId}', 'percent')">
                        <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                    <div class="text-xs text-green-600 mt-1 text-center">
                        占项目: <span class="font-medium manual-percent-display">${allocation.percent}%</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    beauticianList.appendChild(itemDiv);
    
    // 绑定事件
    const select = itemDiv.querySelector('.beautician-select');
    const manualFeeInput = itemDiv.querySelector('.manual-fee-input');
    const manualPercentInput = itemDiv.querySelector('.manual-percent-input');
    const manualFeeDisplay = itemDiv.querySelector('.manual-fee-display');
    const manualPercentDisplay = itemDiv.querySelector('.manual-percent-display');
    
    // 设置初始显示
    updateBeauticianDisplay(manualFeeInput, manualPercentInput, manualFeeDisplay, manualPercentDisplay, projectManualFee);
    
    // 事件监听
    select.addEventListener('change', function() {
        if (this.value) {
            updateBeauticianDisplay(manualFeeInput, manualPercentInput, manualFeeDisplay, manualPercentDisplay, projectManualFee);
        }
    });
    
    manualFeeInput.addEventListener('input', function() {
        const fee = parseFloat(this.value) || 0;
        if (fee < 0) this.value = 0;
        if (fee > projectManualFee) this.value = projectManualFee.toFixed(2);
        
        updateBeauticianDisplay(manualFeeInput, manualPercentInput, manualFeeDisplay, manualPercentDisplay, projectManualFee);
        updateProjectAllocation(projectId, projectManualFee, beauticianId);
    });
    
    manualPercentInput.addEventListener('input', function() {
        const percent = parseFloat(this.value) || 0;
        let adjustedPercent = Math.max(0, Math.min(100, percent));
        const fee = (projectManualFee * adjustedPercent / 100).toFixed(2);
        
        manualFeeInput.value = fee;
        this.value = adjustedPercent;
        
        updateBeauticianDisplay(manualFeeInput, manualPercentInput, manualFeeDisplay, manualPercentDisplay, projectManualFee);
        updateProjectAllocation(projectId, projectManualFee, beauticianId, 'percent');
    });
}

// 更新美容师分配
function updateBeauticianAllocation(projectId, projectManualFee, beauticianId, source = 'amount') {
    const item = document.querySelector(`[data-beautician-id="${beauticianId}"]`);
    if (!item) return;
    
    const manualFeeInput = item.querySelector('.manual-fee-input');
    const manualPercentInput = item.querySelector('.manual-percent-input');
    const manualFeeDisplay = item.querySelector('.manual-fee-display');
    const manualPercentDisplay = item.querySelector('.manual-percent-display');
    
    const fee = parseFloat(manualFeeInput.value) || 0;
    const percent = Math.round((fee / projectManualFee) * 100);
    
    // 更新显示
    manualFeeDisplay.textContent = `¥${fee.toFixed(2)}`;
    manualPercentDisplay.textContent = `${percent}%`;
    manualPercentInput.value = percent;
    
    // 检查是否超额分配
    checkAllocationExcess(projectId, projectManualFee);
    updateAllocationSummary();
}

// 重新分配（当添加/删除美容师时）
function redistributeAllocation(projectId, projectManualFee) {
    const beauticianList = document.getElementById(`beautician-list-${projectId}`);
    const beauticianItems = beauticianList.querySelectorAll('.beautician-select');
    const count = beauticianItems.length;
    
    if (count === 0) {
        document.getElementById(`assigned-manual-fee-${projectId}`).textContent = '¥0.00';
        document.getElementById(`remaining-fee-${projectId}`).textContent = `¥${projectManualFee.toFixed(2)}`;
        document.getElementById(`remaining-fee-${projectId}`).className = 'font-medium ml-1 text-gray-600';
        return;
    }
    
    // 平均分配剩余金额
    const existingItems = beauticianList.querySelectorAll('.beautician-assign-item');
    let totalAllocated = 0;
    
    existingItems.forEach(item => {
        const feeInput = item.querySelector('.manual-fee-input');
        const fee = parseFloat(feeInput.value) || 0;
        totalAllocated += fee;
    });
    
    const remainingFee = projectManualFee - totalAllocated;
    const avgFee = remainingFee / count;
    
    // 如果平均分配导致负数，需要调整
    if (avgFee >= 0) {
        // 重新平均分配
        existingItems.forEach(item => {
            const feeInput = item.querySelector('.manual-fee-input');
            feeInput.value = (parseFloat(feeInput.value) || 0) + avgFee;
            
            // 更新百分比显示
            const percentInput = item.querySelector('.manual-percent-input');
            const percent = Math.round((feeInput.value / projectManualFee) * 100);
            percentInput.value = percent;
            
            const manualFeeDisplay = item.querySelector('.manual-fee-display');
            const manualPercentDisplay = item.querySelector('.manual-percent-display');
            
            if (manualFeeDisplay) manualFeeDisplay.textContent = `¥${feeInput.value}`;
            if (manualPercentDisplay) manualPercentDisplay.textContent = `${percent}%`;
        });
    }
    
    checkAllocationExcess(projectId, projectManualFee);
    updateAllocationSummary();
}

// 检查是否超额分配
function checkAllocationExcess(projectId, projectManualFee) {
    const beauticianList = document.getElementById(`beautician-list-${projectId}`);
    const existingItems = beauticianList.querySelectorAll('.beautician-assign-item');
    
    let totalAllocated = 0;
    existingItems.forEach(item => {
        const feeInput = item.querySelector('.manual-fee-input');
        const fee = parseFloat(feeInput.value) || 0;
        totalAllocated += fee;
    });
    
    const assignedFeeEl = document.getElementById(`assigned-manual-fee-${projectId}`);
    const remainingFeeEl = document.getElementById(`remaining-fee-${projectId}`);
    const warningEl = document.getElementById(`project-warning-${projectId}`);
    
    assignedFeeEl.textContent = `¥${totalAllocated.toFixed(2)}`;
    
    const remaining = projectManualFee - totalAllocated;
    remainingFeeEl.textContent = `¥${remaining.toFixed(2)}`;
    
    // 设置颜色状态
    if (remaining === 0) {
        remainingFeeEl.className = 'font-medium ml-1 text-green-600';
    } else if (remaining > 0) {
        remainingFeeEl.className = 'font-medium ml-1 text-blue-600';
    } else {
        remainingFeeEl.className = 'font-medium ml-1 text-red-600';
    }
    
    // 显示/隐藏警告
    if (totalAllocated > projectManualFee) {
        warningEl.classList.remove('hidden');
    } else {
        warningEl.classList.add('hidden');
    }
}

// 根据百分比更新手工费
function updateManualFeeByPercentage(projectId, projectManualFee, beauticianId) {
    const item = document.querySelector(`[data-beautician-id="${beauticianId}"]`);
    if (!item) return;
    
    const manualPercentInput = item.querySelector('.manual-percent-input');
    const manualFeeInput = item.querySelector('.manual-fee-input');
    const percent = parseFloat(manualPercentInput.value) || 0;
    
    // 计算金额
    const fee = (projectManualFee * percent / 100).toFixed(2);
    manualFeeInput.value = fee;
    
    // 更新显示
    const manualFeeDisplay = item.querySelector('.manual-fee-display');
    const manualPercentDisplay = item.querySelector('.manual-percent-display');
    
    if (manualFeeDisplay) manualFeeDisplay.textContent = `¥${fee}`;
    if (manualPercentDisplay) manualPercentDisplay.textContent = `${percent}%`;
    
    calculateProjectManualFee(projectId, projectManualFee);
}

// 更新分配汇总统计
function updateAllocationSummary() {
    let totalProjectCount = selectedProjectsInModal.length;
    let totalProjectFee = 0;
    let totalAssignedFee = 0;
    
    selectedProjectsInModal.forEach(project => {
        totalProjectFee += project.manualFee;
        
        const assignedFeeEl = document.getElementById(`assigned-manual-fee-${project.id}`);
        if (assignedFeeEl) {
            const feeText = assignedFeeEl.textContent.replace('¥', '').replace(',', '');
            const fee = parseFloat(feeText) || 0;
            totalAssignedFee += fee;
        }
    });
    
    // 安全地更新元素 - 先检查是否存在
    const projectCountEl = document.getElementById('projectCount');
    const totalProjectFeeEl = document.getElementById('totalProjectFee');
    const totalAssignedFeeEl = document.getElementById('totalAssignedFee');
    const totalManualFeeEl = document.getElementById('totalManualFee');
    
    if (projectCountEl) projectCountEl.textContent = totalProjectCount;
    if (totalProjectFeeEl) totalProjectFeeEl.textContent = `¥${totalProjectFee.toFixed(2)}`;
    if (totalAssignedFeeEl) totalAssignedFeeEl.textContent = `¥${totalAssignedFee.toFixed(2)}`;
    if (totalManualFeeEl) totalManualFeeEl.textContent = `¥${totalAssignedFee.toFixed(2)}`;
    
    // 检查是否超额分配
    const allocationTotalDiv = document.getElementById('allocationTotal');
    if (allocationTotalDiv) {
        if (totalAssignedFee > totalProjectFee) {
            allocationTotalDiv.classList.add('border-red-300', 'bg-red-50');
            allocationTotalDiv.classList.remove('border-gray-200', 'bg-gray-50');
        } else {
            allocationTotalDiv.classList.remove('border-red-300', 'bg-red-50');
            allocationTotalDiv.classList.add('border-gray-200', 'bg-gray-50');
        }
    }
}

window.updateAllocationCalculations = function() {
    const amount = parseFloat(document.getElementById('recordAmount').value) || 0;
    
    // 检查并更新总金额显示 - 先检查元素是否存在
    const totalAmountElement = document.getElementById('totalAmount');
    if (totalAmountElement) {
        totalAmountElement.textContent = `总金额: ¥${amount.toFixed(2)}`;
    }
    
    // 计算每个项目的分配
    let totalManualFee = 0;
    let totalPerformance = 0;
    
    selectedProjectsInModal.forEach(project => {
        const beauticianList = document.getElementById(`beautician-list-${project.id}`);
        if (beauticianList) {
            const beauticianItems = beauticianList.querySelectorAll('.beautician-select');
            
            let projectManualFee = 0;
            beauticianItems.forEach(select => {
                if (select.value) {
                    const manualFeeInput = select.parentElement.parentElement.querySelector('.manual-fee-input');
                    const performanceInput = select.parentElement.parentElement.querySelector('.performance-percent-input');
                    const commissionInput = select.parentElement.parentElement.querySelector('.commission-percent-input');
                    
                    // 确保元素存在
                    if (manualFeeInput) {
                        const manualFee = parseFloat(manualFeeInput.value) || 0;
                        projectManualFee += manualFee;
                    }
                    
                    // 检查并计算业绩金额
                    if (performanceInput) {
                        const performancePercent = parseFloat(performanceInput.value) || 0;
                        const performanceAmount = amount * (performancePercent / 100);
                        totalPerformance += performanceAmount;
                    }
                }
            });
            
            // 检查并更新项目手工费显示
            const projectManualFeeElement = document.getElementById(`project-manual-fee-${project.id}`);
            if (projectManualFeeElement) {
                projectManualFeeElement.textContent = projectManualFee.toFixed(2);
            }
            
            totalManualFee += projectManualFee;
        }
    });
    
    // 检查并更新总手工费显示
    const totalManualFeeElement = document.getElementById('totalManualFee');
    if (totalManualFeeElement) {
        totalManualFeeElement.textContent = totalManualFee.toFixed(2);
    }
    
    // 检查并更新总业绩显示
    const totalPerformanceElement = document.getElementById('totalPerformance');
    if (totalPerformanceElement) {
        totalPerformanceElement.textContent = `总业绩: ¥${totalPerformance.toFixed(2)}`;
    }
};

// 计算项目手工费分配
window.calculateProjectManualFee = function(projectId, projectManualFee) {
    const beauticianList = document.getElementById(`beautician-list-${projectId}`);
    const beauticianItems = beauticianList.querySelectorAll('.beautician-select');
    
    const assignedBeauticians = Array.from(beauticianItems).filter(select => select.value).length;
    
    if (assignedBeauticians === 0) {
        document.getElementById(`assigned-manual-fee-${projectId}`).textContent = '¥0.00';
        updateTotalManualFee();
        updateAllocationSummary();
        return;
    }
    
    // 计算已分配的总手工费
    let totalAssignedFee = 0;
    beauticianItems.forEach((select) => {
        if (select.value) {
            const itemDiv = select.closest('.beautician-assign-item');
            const manualFeeInput = itemDiv.querySelector('.manual-fee-input');
            const fee = parseFloat(manualFeeInput.value) || 0;
            totalAssignedFee += fee;
            
            // 更新每行的显示
            const manualFeeDisplay = itemDiv.querySelector('.manual-fee-display');
            if (manualFeeDisplay) manualFeeDisplay.textContent = `¥${fee.toFixed(2)}`;
        }
    });
    
    document.getElementById(`assigned-manual-fee-${projectId}`).textContent = `¥${totalAssignedFee.toFixed(2)}`;
    updateTotalManualFee();
    updateAllocationSummary();
};

// 更新总手工费
function updateTotalManualFee() {
    let totalManualFee = 0;
    selectedProjectsInModal.forEach(project => {
        const assignedFeeEl = document.getElementById(`assigned-manual-fee-${project.id}`);
        if (assignedFeeEl) {
            const feeText = assignedFeeEl.textContent.replace('¥', '').replace(',', '');
            const fee = parseFloat(feeText) || 0;
            totalManualFee += fee;
        }
    });
    
    // 安全检查
    const totalManualFeeEl = document.getElementById('totalManualFee');
    if (totalManualFeeEl) {
        totalManualFeeEl.textContent = totalManualFee.toFixed(2);
    }
}

// 更新销售美容师部分
function updateSalesBeauticianSection() {
    const salesSection = document.getElementById('salesBeauticianSection');
    const amount = parseFloat(document.getElementById('recordAmount').value) || 0;
    const amountType = document.getElementById('recordAmountType').value;
    
    // 只有当金额大于0且金额类型需要销售美容师时才显示
    const showSalesSection = amount > 0 && (amountType === '购卡' || amountType === '购卡消费');
    
    if (showSalesSection) {
        salesSection.classList.remove('hidden');
        
        // 如果金额大于0但没有销售美容师，自动添加一个
        const salesList = document.getElementById('salesBeauticianList');
        if (salesList.children.length === 0) {
            addSalesBeautician();
        }
        
        updateSalesCalculations();
    } else {
        salesSection.classList.add('hidden');
        salesBeauticiansInModal = [];
        document.getElementById('salesBeauticianList').innerHTML = '';
        document.getElementById('salesSummary').classList.add('hidden');
    }
}

function updateProjectSection() {
    const projectSection = document.getElementById('projectSection');
    const amountType = document.getElementById('recordAmountType').value;
    
    // 根据金额类型判断是否显示项目选择
    const showProjectSection = amountType === '单次消费' || amountType === '购卡消费' || !amountType;
    
    if (showProjectSection) {
        projectSection.classList.remove('hidden');
        renderProjectOptions('');
    } else {
        projectSection.classList.add('hidden');
        selectedProjectsInModal = [];
        document.getElementById('selectedProjects').innerHTML = '';
    }
}

// 添加销售美容师
function addSalesBeautician() {
    const salesList = document.getElementById('salesBeauticianList');
    
    const existingSalesBeauticians = Array.from(salesList.querySelectorAll('.sales-beautician-select')).map(select => select.value);
    
    const availableBeauticians = staffData.filter(s => 
        (s.position === '美容师' || s.position === '理疗师') && 
        !existingSalesBeauticians.includes(s.name)
    );
    
    if (availableBeauticians.length === 0) {
        showNotification('info', '没有可用的美容师了');
        return;
    }
    
    const salesId = Date.now() + Math.random();
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'sales-beautician-item bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow transition-shadow';
    itemDiv.dataset.salesId = salesId;
    
    itemDiv.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <div>
                <div class="flex items-center mb-2">
                    <i class="fa fa-user-circle text-primary mr-2"></i>
                    <select class="sales-beautician-select form-input text-sm w-48" required>
                        <option value="">请选择美容师</option>
                        ${availableBeauticians.map(s => `<option value="${s.name}">${s.name} (${s.position})</option>`).join('')}
                    </select>
                </div>
            </div>
            <button type="button" class="remove-sales-beautician text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center transition-colors" 
                    onclick="removeSalesBeautician('${salesId}')" title="删除">
                <i class="fa fa-trash"></i>
            </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 业绩分配 -->
            <div class="bg-blue-50 p-3 rounded-lg">
                <div class="flex items-center mb-2">
                    <i class="fa fa-chart-line text-blue-600 mr-2"></i>
                    <span class="text-sm font-medium text-blue-700">业绩分配</span>
                </div>
                <div class="relative">
                    <input type="number" step="1" min="0" max="100" 
                           class="sales-performance-percent-input form-input text-center text-lg font-bold text-blue-700" 
                           value="50" onchange="updateSalesCalculations()">
                    <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                </div>
                <div class="text-xs text-gray-500 mt-2">
                    分配比例: <span class="font-medium performance-display-percent">50</span>%
                </div>
                <div class="text-xs text-blue-600 mt-1">
                    业绩金额: <span class="font-medium performance-display-amount">¥0.00</span>
                </div>
            </div>
            
            <!-- 提成计算 -->
            <div class="bg-green-50 p-3 rounded-lg">
                <div class="flex items-center mb-2">
                    <i class="fa fa-money text-green-600 mr-2"></i>
                    <span class="text-sm font-medium text-green-700">提成计算</span>
                </div>
                <div class="relative">
                    <input type="number" step="0.01" min="0" max="100" 
                           class="sales-commission-percent-input form-input text-center text-lg font-bold text-green-700" 
                           value="3" onchange="updateSalesCalculations()">
                    <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                </div>
                <div class="text-xs text-gray-500 mt-2">
                    提成比例: <span class="font-medium commission-display-percent">3</span>%
                </div>
                <div class="text-xs text-green-600 mt-1">
                    提成金额: <span class="font-medium commission-display-amount">¥0.00</span>
                </div>
            </div>
        </div>
    `;
    
    salesList.appendChild(itemDiv);
    
    const select = itemDiv.querySelector('.sales-beautician-select');
    const performanceInput = itemDiv.querySelector('.sales-performance-percent-input');
    const commissionInput = itemDiv.querySelector('.sales-commission-percent-input');
    const performancePercentDisplay = itemDiv.querySelector('.performance-display-percent');
    const performanceAmountDisplay = itemDiv.querySelector('.performance-display-amount');
    const commissionPercentDisplay = itemDiv.querySelector('.commission-display-percent');
    const commissionAmountDisplay = itemDiv.querySelector('.commission-display-amount');
    
    // 更新显示函数
    const updateDisplay = () => {
        const amount = parseFloat(document.getElementById('recordAmount').value) || 0;
        const performancePercent = parseFloat(performanceInput.value) || 0;
        const commissionPercent = parseFloat(commissionInput.value) || 0;
        
        const performanceAmount = amount * (performancePercent / 100);
        const commissionAmount = performanceAmount * (commissionPercent / 100);
        
        performancePercentDisplay.textContent = performancePercent.toFixed(0);
        performanceAmountDisplay.textContent = `¥${performanceAmount.toFixed(2)}`;
        commissionPercentDisplay.textContent = commissionPercent.toFixed(2);
        commissionAmountDisplay.textContent = `¥${commissionAmount.toFixed(2)}`;
    };
    
    // 添加事件监听
    select.addEventListener('change', function() {
        if (this.value) {
            updateSalesCalculations();
        }
    });
    
    performanceInput.addEventListener('input', function() {
        updateDisplay();
        updateSalesCalculations();
    });
    
    commissionInput.addEventListener('input', function() {
        updateDisplay();
        updateSalesCalculations();
    });
    
    // 默认选择第一个可用的美容师
    if (availableBeauticians.length > 0) {
        select.value = availableBeauticians[0].name;
        updateDisplay();
        updateSalesCalculations();
    }
    
    // 显示汇总部分
    document.getElementById('salesSummary').classList.remove('hidden');
}

// 移除销售美容师
window.removeSalesBeautician = function(salesId) {
    const item = document.querySelector(`[data-sales-id="${salesId}"]`);
    if (item) {
        item.remove();
        
        // 重新计算百分比（使剩余美容师百分比平均分配）
        redistributePerformancePercentages();
        
        updateSalesCalculations();
        
        // 如果没有销售美容师了，隐藏汇总
        const salesList = document.getElementById('salesBeauticianList');
        const salesSummary = document.getElementById('salesSummary');
        if (salesList.children.length === 0) {
            salesSummary.classList.add('hidden');
        }
    }
};

// 重新分配业绩百分比
function redistributePerformancePercentages() {
    const salesList = document.getElementById('salesBeauticianList');
    if (!salesList) return;
    
    const salesItems = salesList.querySelectorAll('.sales-beautician-select');
    const count = salesItems.length;
    
    if (count === 0) return;
    
    // 计算当前百分比总和
    let currentTotal = 0;
    salesItems.forEach((select) => {
        if (select.value) {
            const itemDiv = select.closest('[data-sales-id]');
            const performanceInput = itemDiv.querySelector('.sales-performance-percent-input');
            if (performanceInput) {
                currentTotal += parseFloat(performanceInput.value) || 0;
            }
        }
    });
    
    // 如果总和接近100%，不调整
    if (Math.abs(currentTotal - 100) < 0.1) return;
    
    // 平均分配百分比
    const avgPercent = Math.round(100 / count);
    
    salesItems.forEach((select, index) => {
        if (select.value) {
            const itemDiv = select.closest('[data-sales-id]');
            const performanceInput = itemDiv.querySelector('.sales-performance-percent-input');
            
            if (performanceInput) {
                // 最后一个美容师获得剩余的百分比
                if (index === count - 1) {
                    const allocated = (count - 1) * avgPercent;
                    const remaining = 100 - allocated;
                    performanceInput.value = remaining;
                } else {
                    performanceInput.value = avgPercent;
                }
                
                // 触发输入事件以更新显示
                performanceInput.dispatchEvent(new Event('input'));
            }
        }
    });
}

// 添加数据修复函数，在加载时调用
function fixExistingData() {
    for (let month in yearBusinessData) {
        yearBusinessData[month].forEach((record, index) => {
            if (record.销售美容师) {
                record.销售美容师.forEach((sales, salesIndex) => {
                    // 确保百分比是数字类型
                    if (typeof sales.业绩百分比 === 'string') {
                        sales.业绩百分比 = parseFloat(sales.业绩百分比) || 50;
                    }
                    if (typeof sales.提成比例 === 'string') {
                        sales.提成比例 = parseFloat(sales.提成比例) || 3;
                    }
                    
                    // 重新计算金额（基于百分比）
                    const amount = record.金额 || 0;
                    sales.业绩金额 = amount * (sales.业绩百分比 / 100);
                    sales.提成金额 = sales.业绩金额 * (sales.提成比例 / 100);
                });
            }
        });
    }
    saveDataToLocalStorage();
}

// 更新销售计算
window.updateSalesCalculations = function() {
    const amount = parseFloat(document.getElementById('recordAmount').value) || 0;
    const salesList = document.getElementById('salesBeauticianList');
    const salesItems = salesList.querySelectorAll('.sales-beautician-select');
    const salesSummary = document.getElementById('salesSummary');
    
    let totalPerformancePercent = 0;
    let totalPerformance = 0;
    let totalCommission = 0;
    
    salesBeauticiansInModal = [];
    
    // 计算每个销售美容师的业绩
    salesItems.forEach((select, index) => {
        if (select.value) {
            const itemDiv = select.closest('[data-sales-id]');
            const performanceInput = itemDiv.querySelector('.sales-performance-percent-input');
            const commissionInput = itemDiv.querySelector('.sales-commission-percent-input');
            
            const performancePercent = parseFloat(performanceInput.value) || 0;
            const commissionPercent = parseFloat(commissionInput.value) || 0;
            
            totalPerformancePercent += performancePercent;
            
            // 计算具体金额
            const performanceAmount = amount * (performancePercent / 100);
            const commissionAmount = performanceAmount * (commissionPercent / 100);
            
            totalPerformance += performanceAmount;
            totalCommission += commissionAmount;
            
            // 更新行内显示
            const performancePercentDisplay = itemDiv.querySelector('.performance-display-percent');
            const performanceAmountDisplay = itemDiv.querySelector('.performance-display-amount');
            const commissionPercentDisplay = itemDiv.querySelector('.commission-display-percent');
            const commissionAmountDisplay = itemDiv.querySelector('.commission-display-amount');
            
            if (performancePercentDisplay) performancePercentDisplay.textContent = performancePercent.toFixed(0);
            if (performanceAmountDisplay) performanceAmountDisplay.textContent = `¥${performanceAmount.toFixed(2)}`;
            if (commissionPercentDisplay) commissionPercentDisplay.textContent = commissionPercent.toFixed(2);
            if (commissionAmountDisplay) commissionAmountDisplay.textContent = `¥${commissionAmount.toFixed(2)}`;
            
            salesBeauticiansInModal.push({
                name: select.value,
                performancePercent: performancePercent,
                commissionPercent: commissionPercent,
                performanceAmount: performanceAmount,
                commissionAmount: commissionAmount
            });
        }
    });
    
    // 更新汇总显示
    document.getElementById('totalSalesAmount').textContent = `¥${amount.toFixed(2)}`;
    document.getElementById('totalPerformanceAmount').textContent = `¥${totalPerformance.toFixed(2)}`;
    document.getElementById('totalCommissionAmount').textContent = `¥${totalCommission.toFixed(2)}`;
    
    // 显示/隐藏汇总部分
    if (salesItems.length > 0 && amount > 0) {
        salesSummary.classList.remove('hidden');
    } else {
        salesSummary.classList.add('hidden');
    }
    
    // 验证业绩百分比总和
    const warning = document.getElementById('percentageWarning');
    if (amount > 0 && Math.abs(totalPerformancePercent - 100) > 0.01) {
        warning.textContent = `业绩百分比总和为 ${totalPerformancePercent.toFixed(1)}%，应为100%`;
        warning.classList.remove('hidden');
        warning.classList.add('bg-red-50', 'text-red-600', 'p-2', 'rounded');
    } else {
        warning.classList.add('hidden');
        warning.classList.remove('bg-red-50', 'text-red-600', 'p-2', 'rounded');
    }
};

// 修改 openRecordModal 函数中的编辑逻辑
function openRecordModal(index) {
    const modal = document.getElementById('recordModal');
    const title = document.getElementById('recordModalTitle');
    const recordIndex = document.getElementById('recordIndex');
    const recordMonth = document.getElementById('recordMonth');
    const recordDate = document.getElementById('recordDate');
    
    console.log('打开记录模态框，index:', index);
    
    // 1. 重置所有状态和UI
    resetRecordModalState();
    
    // 设置当前月份
    recordMonth.value = currentMonth;
    
    // 设置默认日期
    const today = new Date();
    const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    recordDate.value = defaultDate;
    
    // 2. 区分新增和编辑
    if (index === -1) {
        // 新增记录 - 默认显示项目选择和服务美容师分配
        setupNewRecord(title, recordIndex);
    } else {
        // 编辑记录
        setupEditRecord(index, title, recordIndex);
    }
    
    // 3. 显示模态框
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.querySelector('div[class*="bg-white"]').classList.add('scale-100');
        modal.querySelector('div[class*="bg-white"]').classList.remove('scale-95');
    }, 10);
}

// 重置模态框状态
function resetRecordModalState() {
    selectedProjectsInModal = [];
    salesBeauticiansInModal = [];
    projectAllocationsInModal = {};
    
    // 重置表单
    document.getElementById('recordForm').reset();
    document.getElementById('selectedProjects').innerHTML = '';
    document.getElementById('beauticianAllocationList').innerHTML = '';
    document.getElementById('salesBeauticianList').innerHTML = '';
    document.getElementById('percentageWarning').classList.add('hidden');
    document.getElementById('salesSummary').classList.add('hidden');
    document.getElementById('projectSearch').value = '';
    
    // 修改这里：重置所有部分为隐藏状态
    document.getElementById('amountInputSection').classList.add('hidden');
    document.getElementById('projectSection').classList.add('hidden');
    document.getElementById('beauticianAllocationSection').classList.add('hidden');
    document.getElementById('salesBeauticianSection').classList.add('hidden');
    
    // 修改这里：默认不选择金额类型
    document.getElementById('recordAmountType').value = '';
}

// 设置新增记录
function setupNewRecord(title, recordIndex) {
    title.textContent = '新增业务记录';
    recordIndex.value = -1;
    
    // 新增逻辑：默认显示项目选择和服务美容师分配部分
    document.getElementById('projectSection').classList.remove('hidden');
    document.getElementById('beauticianAllocationSection').classList.remove('hidden');
    
    // 金额类型设为空（表示不选择金额类型）
    document.getElementById('recordAmountType').value = '';
    
    // 隐藏金额输入和销售美容师部分
    document.getElementById('amountInputSection').classList.add('hidden');
    document.getElementById('salesBeauticianSection').classList.add('hidden');
    
    // 渲染项目选项
    renderProjectOptions('');
}

// 设置编辑记录
function setupEditRecord(index, title, recordIndex) {
    title.textContent = '编辑业务记录';
    recordIndex.value = index;
    
    const data = getFilteredData();
    const record = data[index];
    
    if (!record) return;
    
    // 1. 填充基础字段
    fillBasicFields(record);
    
    // 2. 判断并设置金额类型
    const amountType = determineAmountType(record);
    document.getElementById('recordAmountType').value = amountType;
    
    // 3. 更新表单布局
    updateRecordFormLayout();
    
    // 4. 如果有金额，设置金额值
    if (record.金额 > 0) {
        document.getElementById('recordAmount').value = record.金额;
    }
    
    // 5. 根据金额类型加载相应数据
    if (amountType === '单次消费' || amountType === '购卡消费') {
        // 加载项目
        loadProjectsFromRecord(record);
        
        // 如果选择了项目，创建项目分配界面
        if (selectedProjectsInModal.length > 0) {
            setupProjectAllocationSection(record);
        }
    }
    
    // 6. 处理销售美容师部分
    if ((amountType === '购卡' || amountType === '购卡消费') && record.金额 > 0) {
        setupSalesBeauticianSection(record, record.金额);
    }
    
    // 7. 渲染项目选项
    renderProjectOptions('');
    
    // 8. 最终更新计算
    finalizeSetup(record);
}

// 添加判断金额类型的函数
function determineAmountType(record) {
    const amount = record.金额 || 0;
    const projectNames = record.项目.split(',').map(name => name.trim()).filter(name => name);
    
    // 检查是否是服务项目
    const hasServiceProjects = projectNames.some(project => 
        project !== "交款" && project !== "登记" && project !== "咨询"
    );
    
    // 检查是否有销售美容师
    const hasSalesBeautician = (record.销售美容师 && record.销售美容师.length > 0) || 
        (record.美容师分配 && record.美容师分配.some(alloc => 
            alloc.美容师类型 === '销售' || 
            (alloc.业绩百分比 > 0 && alloc.业绩百分比 < 100)
        ));
    
    if (amount > 0) {
        if (hasServiceProjects && hasSalesBeautician) {
            return '购卡消费';
        } else if (hasServiceProjects && !hasSalesBeautician) {
            return '单次消费';
        } else if (!hasServiceProjects && hasSalesBeautician) {
            return '购卡';
        }
    }
    
    // 如果没有金额，但项目只有"交款"或"登记"，则可能是购卡
    if ((projectNames.includes("交款") || projectNames.includes("登记")) && hasSalesBeautician) {
        return '购卡';
    }
    
    // 默认返回空，让用户选择
    return '';
}

// 填充基础字段
function fillBasicFields(record) {
    // 处理日期
    const dateParts = record.到店日期.split('.');
    const currentYear = new Date().getFullYear();
    const formattedDate = `${currentYear}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
    
    document.getElementById('recordDate').value = formattedDate;
    document.getElementById('recordCustomer').value = record.客户名称;
    document.getElementById('recordChannel').value = record.到店途径;
    document.getElementById('recordAmount').value = record.金额 || 0;
}

// 从记录中加载项目
function loadProjectsFromRecord(record) {
    const projectNames = record.项目.split(',').map(name => name.trim()).filter(name => name);
    
    projectNames.forEach(projectName => {
        const project = projectsData.find(p => p.name === projectName);
        if (project) {
            selectedProjectsInModal.push({
                id: project.id,
                name: project.name,
                type: project.type,
                manualFee: project.manualFee
            });
        }
    });
    
    // 渲染选择的项目
    renderSelectedProjects();
}

// 设置项目分配部分
function setupProjectAllocationSection(record) {
    document.getElementById('beauticianAllocationSection').classList.remove('hidden');
    
    // 清除现有内容
    const allocationList = document.getElementById('beauticianAllocationList');
    allocationList.innerHTML = '';
    
    // 为每个项目创建分配卡片
    selectedProjectsInModal.forEach((project, idx) => {
        const projectCard = createProjectCard(project);
        allocationList.appendChild(projectCard);
        
        // 添加分隔线
        if (idx < selectedProjectsInModal.length - 1) {
            const separator = document.createElement('div');
            separator.className = 'my-6 border-t border-dashed border-gray-200';
            allocationList.appendChild(separator);
        }
    });
    
    // 延迟加载服务美容师分配数据（确保DOM已渲染）
    if (record.美容师分配 && record.美容师分配.length > 0) {
        // 使用多层延迟确保DOM完全渲染
        setTimeout(() => {
            loadBeauticianAllocations(record.美容师分配);
        }, 150);
    }
}

// 设置销售美容师部分
function setupSalesBeauticianSection(record, amount) {
    document.getElementById('salesBeauticianSection').classList.remove('hidden');
    
    // 使用Promise链确保顺序执行
    const loadSalesPromise = new Promise((resolve) => {
        setTimeout(() => {
            if (record.销售美容师 && record.销售美容师.length > 0) {
                // 清空现有列表
                const salesList = document.getElementById('salesBeauticianList');
                if (salesList) salesList.innerHTML = '';
                salesBeauticiansInModal = [];
                
                // 按顺序添加销售美容师
                record.销售美容师.forEach((sales, index) => {
                    setTimeout(() => {
                        addSalesBeauticianFromData(sales);
                    }, 100 * index);
                });
                
                // 所有销售美容师添加完成后
                setTimeout(() => {
                    // 重新计算百分比确保总和为100%
                    redistributePerformancePercentages();
                    updateSalesCalculations();
                    resolve();
                }, record.销售美容师.length * 100 + 200);
            } else {
                // 如果没有销售美容师，添加一个
                addSalesBeautician();
                resolve();
            }
        }, 300); // 比项目部分稍晚开始
    });
    
    return loadSalesPromise;
}

// 完成设置，更新所有计算
function finalizeSetup(record) {
    // 使用setTimeout链确保顺序
    setTimeout(() => {
        // 1. 更新项目分配状态
        selectedProjectsInModal.forEach(project => {
            checkProjectAllocationStatus(project.id, project.manualFee);
        });
        
        // 2. 更新汇总
        updateAllocationSummary();
        
        // 3. 如果有金额，更新销售计算
        const amount = record.金额 || 0;
        if (amount > 0) {
            setTimeout(() => {
                updateSalesCalculations();
                
                // 验证百分比
                setTimeout(() => {
                    validatePerformancePercentages();
                }, 100);
            }, 300);
        }
    }, 500);
}

// 验证业绩百分比
function validatePerformancePercentages() {
    const salesList = document.getElementById('salesBeauticianList');
    if (!salesList) return;
    
    const salesItems = salesList.querySelectorAll('.sales-beautician-select');
    let totalPercent = 0;
    let hasValues = false;
    
    salesItems.forEach((select) => {
        if (select.value) {
            hasValues = true;
            const itemDiv = select.closest('[data-sales-id]');
            const performanceInput = itemDiv.querySelector('.sales-performance-percent-input');
            if (performanceInput) {
                totalPercent += parseFloat(performanceInput.value) || 0;
            }
        }
    });
    
    // 如果有值且百分比总和不是100%，自动调整
    if (hasValues && Math.abs(totalPercent - 100) > 0.01 && salesItems.length > 0) {
        setTimeout(() => {
            redistributePerformancePercentages();
            updateSalesCalculations();
        }, 50);
    }
}

// 新增函数：加载销售美容师分配数据
function loadSalesBeauticianAllocations(salesAllocations) {
    if (!salesAllocations || salesAllocations.length === 0) {
        addSalesBeautician(); // 如果没有销售美容师，添加一个默认的
        return;
    }
    
    const salesList = document.getElementById('salesBeauticianList');
    if (!salesList) return;
    
    // 清空现有列表
    salesList.innerHTML = '';
    salesBeauticiansInModal = [];
    
    // 添加销售美容师
    salesAllocations.forEach((sales, index) => {
        setTimeout(() => {
            addSalesBeauticianFromData(sales);
        }, 150 * index);
    });
    
    // 确保百分比总和为100%
    setTimeout(() => {
        redistributePerformancePercentages();
        updateSalesCalculations();
    }, salesAllocations.length * 150 + 100);
}

// 加载已分配的美容师
function loadBeauticianAllocations(allocations) {
    console.log('开始加载美容师分配:', allocations);
    
    // 首先确保所有项目都有分配界面
    selectedProjectsInModal.forEach(project => {
        const beauticianList = document.getElementById(`beautician-list-${project.id}`);
        if (beauticianList) {
            // 清除现有的美容师
            beauticianList.innerHTML = '';
        }
    });
    
    // 按项目ID分组分配
    const allocationsByProject = {};
    allocations.forEach(allocation => {
        // 尝试从不同字段获取项目ID
        let projectId;
        if (allocation.项目ID) {
            projectId = allocation.项目ID;
        } else if (allocation.id) {
            projectId = allocation.id;
        } else {
            // 如果都没有，尝试通过项目名称匹配
            const project = selectedProjectsInModal.find(p => p.name === allocation.项目名称);
            if (project) {
                projectId = project.id;
            }
        }
        
        if (projectId) {
            if (!allocationsByProject[projectId]) {
                allocationsByProject[projectId] = [];
            }
            allocationsByProject[projectId].push(allocation);
        }
    });
    
    console.log('按项目分组:', allocationsByProject);
    
    // 为每个项目的分配添加美容师
    selectedProjectsInModal.forEach(project => {
        const projectAllocations = allocationsByProject[project.id] || [];
        
        console.log(`项目 ${project.name} 的分配记录:`, projectAllocations);
        
        if (projectAllocations.length === 0) {
            // 如果没有分配记录，添加一个默认的
            setTimeout(() => {
                addBeauticianToProject(project.id, project.manualFee);
            }, 100);
        } else {
            // 为每个分配记录创建美容师
            projectAllocations.forEach((allocation, index) => {
                setTimeout(() => {
                    createBeauticianForProject(project, allocation);
                }, 100 * index);
            });
        }
    });
    
    // 延迟更新分配状态
    setTimeout(() => {
        selectedProjectsInModal.forEach(project => {
            checkProjectAllocationStatus(project.id, project.manualFee);
        });
        updateAllocationSummary();
    }, 500);
}

// 新增函数：从数据加载销售美容师
function addSalesBeauticianFromData(salesData) {
    const salesList = document.getElementById('salesBeauticianList');
    if (!salesList) {
        // 如果元素不存在，稍后重试
        setTimeout(() => addSalesBeauticianFromData(salesData), 100);
        return;
    }
    
    const existingItems = salesList.querySelectorAll('.sales-beautician-select');
    const existingNames = Array.from(existingItems).map(select => select.value);
    
    // 如果美容师已经存在，合并数据
    if (existingNames.includes(salesData.美容师)) {
        // 找到现有项并更新
        const existingItem = Array.from(existingItems).find(select => select.value === salesData.美容师);
        if (existingItem) {
            const itemDiv = existingItem.closest('[data-sales-id]');
            if (itemDiv) {
                const performanceInput = itemDiv.querySelector('.sales-performance-percent-input');
                const commissionInput = itemDiv.querySelector('.sales-commission-percent-input');
                
                if (performanceInput) {
                    performanceInput.value = salesData.业绩百分比 || 50;
                    performanceInput.dispatchEvent(new Event('input'));
                }
                if (commissionInput) {
                    commissionInput.value = salesData.提成比例 || 3;
                    commissionInput.dispatchEvent(new Event('input'));
                }
            }
        }
        return;
    }
    
    // 获取可用的美容师
    const availableBeauticians = staffData.filter(s => 
        (s.position === '美容师' || s.position === '理疗师') && 
        !existingNames.includes(s.name)
    );
    
    // 如果指定的美容师不在可用列表中，但仍然需要添加
    const specifiedBeautician = staffData.find(s => s.name === salesData.美容师);
    
    const salesId = Date.now() + Math.random();
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'sales-beautician-item bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow transition-shadow';
    itemDiv.dataset.salesId = salesId;
    
    // 准备选项
    let optionsHTML = '<option value="">请选择美容师</option>';
    if (specifiedBeautician) {
        optionsHTML += `<option value="${specifiedBeautician.name}" selected>${specifiedBeautician.name} (${specifiedBeautician.position})</option>`;
    }
    optionsHTML += availableBeauticians.map(s => 
        `<option value="${s.name}">${s.name} (${s.position})</option>`
    ).join('');
    
    // 在 addSalesBeauticianFromData 函数中，确保正确设置百分比
    // 修改 HTML 生成部分，确保 input 值正确设置
    itemDiv.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <div>
                <div class="flex items-center mb-2">
                    <i class="fa fa-user-circle text-primary mr-2"></i>
                    <select class="sales-beautician-select form-input text-sm w-48" required>
                        ${optionsHTML}
                    </select>
                </div>
            </div>
            <button type="button" class="remove-sales-beautician text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center transition-colors" 
                    onclick="removeSalesBeautician('${salesId}')" title="删除">
                <i class="fa fa-trash"></i>
            </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 业绩分配 -->
            <div class="bg-blue-50 p-3 rounded-lg">
                <div class="flex items-center mb-2">
                    <i class="fa fa-chart-line text-blue-600 mr-2"></i>
                    <span class="text-sm font-medium text-blue-700">业绩分配</span>
                </div>
                <div class="relative">
                    <input type="number" step="1" min="0" max="100" 
                        class="sales-performance-percent-input form-input text-center text-lg font-bold text-blue-700" 
                        value="${parseFloat(salesData.业绩百分比) || 50}" 
                        onchange="updateSalesCalculations()">
                    <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                </div>
                <div class="text-xs text-gray-500 mt-2">
                    分配比例: <span class="font-medium performance-display-percent">${parseFloat(salesData.业绩百分比) || 50}</span>%
                </div>
                <div class="text-xs text-blue-600 mt-1">
                    业绩金额: <span class="font-medium performance-display-amount">¥${salesData.业绩金额 ? salesData.业绩金额.toFixed(2) : '0.00'}</span>
                </div>
            </div>
            
            <!-- 提成计算 -->
            <div class="bg-green-50 p-3 rounded-lg">
                <div class="flex items-center mb-2">
                    <i class="fa fa-money text-green-600 mr-2"></i>
                    <span class="text-sm font-medium text-green-700">提成计算</span>
                </div>
                <div class="relative">
                    <input type="number" step="0.01" min="0" max="100" 
                        class="sales-commission-percent-input form-input text-center text-lg font-bold text-green-700" 
                        value="${parseFloat(salesData.提成比例) || 3}" 
                        onchange="updateSalesCalculations()">
                    <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                </div>
                <div class="text-xs text-gray-500 mt-2">
                    提成比例: <span class="font-medium commission-display-percent">${parseFloat(salesData.提成比例) || 3}</span>%
                </div>
                <div class="text-xs text-green-600 mt-1">
                    提成金额: <span class="font-medium commission-display-amount">¥${salesData.提成金额 ? salesData.提成金额.toFixed(2) : '0.00'}</span>
                </div>
            </div>
        </div>
    `;
        
    salesList.appendChild(itemDiv);
    
    // 绑定事件
    const select = itemDiv.querySelector('.sales-beautician-select');
    const performanceInput = itemDiv.querySelector('.sales-performance-percent-input');
    const commissionInput = itemDiv.querySelector('.sales-commission-percent-input');
    const performancePercentDisplay = itemDiv.querySelector('.performance-display-percent');
    const performanceAmountDisplay = itemDiv.querySelector('.performance-display-amount');
    const commissionPercentDisplay = itemDiv.querySelector('.commission-display-percent');
    const commissionAmountDisplay = itemDiv.querySelector('.commission-display-amount');
    
    // 更新显示函数
    const updateDisplay = () => {
        const amount = parseFloat(document.getElementById('recordAmount').value) || 0;
        const performancePercent = parseFloat(performanceInput.value) || 0;
        const commissionPercent = parseFloat(commissionInput.value) || 0;
        
        const performanceAmount = amount * (performancePercent / 100);
        const commissionAmount = performanceAmount * (commissionPercent / 100);
        
        if (performancePercentDisplay) performancePercentDisplay.textContent = performancePercent.toFixed(0);
        if (performanceAmountDisplay) performanceAmountDisplay.textContent = `¥${performanceAmount.toFixed(2)}`;
        if (commissionPercentDisplay) commissionPercentDisplay.textContent = commissionPercent.toFixed(2);
        if (commissionAmountDisplay) commissionAmountDisplay.textContent = `¥${commissionAmount.toFixed(2)}`;
    };
    
    // 添加事件监听
    select.addEventListener('change', function() {
        updateSalesCalculations();
    });
    
    performanceInput.addEventListener('input', function() {
        updateDisplay();
        updateSalesCalculations();
    });
    
    commissionInput.addEventListener('input', function() {
        updateDisplay();
        updateSalesCalculations();
    });
    
    // 初始化显示
    updateDisplay();
    
    // 显示汇总部分
    document.getElementById('salesSummary').classList.remove('hidden');
    
    // 添加到销售美容师数组
    salesBeauticiansInModal.push({
        name: select.value || salesData.美容师,
        performancePercent: parseFloat(performanceInput.value) || 0,
        commissionPercent: parseFloat(commissionInput.value) || 0,
        performanceAmount: parseFloat(document.getElementById('recordAmount').value || 0) * (parseFloat(performanceInput.value) || 0) / 100,
        commissionAmount: (parseFloat(document.getElementById('recordAmount').value || 0) * (parseFloat(performanceInput.value) || 0) / 100) * (parseFloat(commissionInput.value) || 0) / 100
    });
}

// 修改：为项目创建美容师分配项
function createBeauticianForProject(project, allocation) {
    const beauticianList = document.getElementById(`beautician-list-${project.id}`);
    if (!beauticianList) {
        console.log(`美容师列表不存在: beautician-list-${project.id}`);
        // 如果元素不存在，重新创建项目卡片
        const projectCard = createProjectCard(project);
        const allocationList = document.getElementById('beauticianAllocationList');
        const existingCard = document.getElementById(`project-card-${project.id}`);
        
        if (existingCard) {
            allocationList.replaceChild(projectCard, existingCard);
        }
        
        // 递归调用
        setTimeout(() => createBeauticianForProject(project, allocation), 200);
        return;
    }
    
    // 获取现有的美容师名称
    const existingBeauticians = Array.from(beauticianList.querySelectorAll('.beautician-select')).map(select => select.value);
    console.log(`现有美容师: ${existingBeauticians.join(', ')}`);
    
    // 获取可用的美容师
    const availableBeauticians = staffData.filter(s => 
        (s.position === '美容师' || s.position === '理疗师') && 
        !existingBeauticians.includes(s.name)
    );
    
    const beauticianId = Date.now() + Math.random();
    
    // 准备选项
    let optionsHTML = '<option value="">请选择美容师</option>';
    const specifiedBeautician = staffData.find(s => s.name === allocation.美容师);
    if (specifiedBeautician && !existingBeauticians.includes(specifiedBeautician.name)) {
        optionsHTML += `<option value="${specifiedBeautician.name}" selected>${specifiedBeautician.name} (${specifiedBeautician.position})</option>`;
    }
    optionsHTML += availableBeauticians.map(s => 
        `<option value="${s.name}">${s.name} (${s.position})</option>`
    ).join('');
    
    // 计算手工费
    const manualFee = allocation.手工费 || allocation.manualFee || (project.manualFee / 1).toFixed(2);
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'beautician-assign-item bg-white border border-gray-200 rounded-lg p-4 mb-3';
    itemDiv.dataset.beauticianId = beauticianId;
    itemDiv.dataset.projectId = project.id;
    
    itemDiv.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <div class="flex items-center">
                <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <i class="fa fa-user text-primary text-sm"></i>
                </div>
                <select class="beautician-select form-input text-sm w-48" required>
                    ${optionsHTML}
                </select>
            </div>
            <button type="button" 
                    class="remove-beautician text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    onclick="removeBeauticianFromProject(${project.id}, ${project.manualFee}, '${beauticianId}')"
                    title="删除">
                <i class="fa fa-times"></i>
            </button>
        </div>
        
        <div class="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <div class="flex items-center mb-2">
                <i class="fa fa-hand-paper-o text-blue-600 mr-2"></i>
                <span class="text-sm font-medium text-blue-700">手工费分配</span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label class="text-xs text-gray-500 mb-1 block">分配金额 (元)</label>
                    <div class="relative">
                        <input type="number" step="0.01" min="0" max="${project.manualFee}" 
                               class="manual-fee-input form-input text-center font-medium text-blue-700" 
                               value="${manualFee.toFixed(2)}"
                               onchange="updateProjectAllocation(${project.id}, ${project.manualFee}, '${beauticianId}')">
                        <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">元</span>
                    </div>
                    <div class="text-xs text-blue-600 mt-1 text-center">
                        当前: <span class="font-medium manual-fee-display">¥${manualFee.toFixed(2)}</span>
                    </div>
                </div>
                
                <div>
                    <label class="text-xs text-gray-500 mb-1 block">分配比例</label>
                    <div class="relative">
                        <input type="number" step="1" min="0" max="100" 
                               class="manual-percent-input form-input text-center font-medium text-green-700" 
                               value="${Math.round((manualFee / project.manualFee) * 100)}"
                               onchange="updateProjectAllocation(${project.id}, ${project.manualFee}, '${beauticianId}', 'percent')">
                        <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                    <div class="text-xs text-green-600 mt-1 text-center">
                        占项目: <span class="font-medium manual-percent-display">${Math.round((manualFee / project.manualFee) * 100)}%</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    beauticianList.appendChild(itemDiv);
    
    // 绑定事件
    const select = itemDiv.querySelector('.beautician-select');
    const manualFeeInput = itemDiv.querySelector('.manual-fee-input');
    const manualPercentInput = itemDiv.querySelector('.manual-percent-input');
    const manualFeeDisplay = itemDiv.querySelector('.manual-fee-display');
    const manualPercentDisplay = itemDiv.querySelector('.manual-percent-display');
    
    // 设置初始显示
    updateBeauticianDisplay(manualFeeInput, manualPercentInput, manualFeeDisplay, manualPercentDisplay, project.manualFee);
    
    // 事件监听
    select.addEventListener('change', function() {
        if (this.value) {
            updateBeauticianDisplay(manualFeeInput, manualPercentInput, manualFeeDisplay, manualPercentDisplay, project.manualFee);
        }
    });
    
    manualFeeInput.addEventListener('input', function() {
        const fee = parseFloat(this.value) || 0;
        if (fee < 0) this.value = 0;
        if (fee > project.manualFee) this.value = project.manualFee.toFixed(2);
        
        updateBeauticianDisplay(manualFeeInput, manualPercentInput, manualFeeDisplay, manualPercentDisplay, project.manualFee);
        updateProjectAllocation(project.id, project.manualFee, beauticianId);
    });
    
    manualPercentInput.addEventListener('input', function() {
        const percent = parseFloat(this.value) || 0;
        let adjustedPercent = Math.max(0, Math.min(100, percent));
        const fee = (project.manualFee * adjustedPercent / 100).toFixed(2);
        
        manualFeeInput.value = fee;
        this.value = adjustedPercent;
        
        updateBeauticianDisplay(manualFeeInput, manualPercentInput, manualFeeDisplay, manualPercentDisplay, project.manualFee);
        updateProjectAllocation(project.id, project.manualFee, beauticianId, 'percent');
    });
    
    console.log(`已创建美容师分配: ${allocation.美容师 || '未知'} - ¥${manualFee.toFixed(2)}`);
}

// 安全更新元素函数
function safeUpdateElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = content;
    } else {
        console.warn(`Element with id "${elementId}" not found`);
    }
}

// 修改updateTotalManualFee函数使用安全检查
function updateTotalManualFee() {
    let totalManualFee = 0;
    selectedProjectsInModal.forEach(project => {
        const assignedFeeEl = document.getElementById(`assigned-manual-fee-${project.id}`);
        if (assignedFeeEl) {
            const feeText = assignedFeeEl.textContent.replace('¥', '').replace(',', '');
            const fee = parseFloat(feeText) || 0;
            totalManualFee += fee;
        }
    });
    
    safeUpdateElement('totalManualFee', totalManualFee.toFixed(2));
}
function closeRecordModal() {
    const modal = document.getElementById('recordModal');
    const modalContent = modal.querySelector('div[class*="bg-white"]');
    
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        selectedProjectsInModal = [];
    }, 200);
}

// 如果需要，也可以修改保存记录时的逻辑，确保区分服务美容师和销售美容师
function saveRecord() {
    try {
        const index = parseInt(document.getElementById('recordIndex').value);
        const month = parseInt(document.getElementById('recordMonth').value);
        
        const date = document.getElementById('recordDate').value;
        const customer = document.getElementById('recordCustomer').value;
        const channel = document.getElementById('recordChannel').value;
        const amountType = document.getElementById('recordAmountType').value;
        const amount = parseFloat(document.getElementById('recordAmount').value) || 0;
        
        // 基础验证：日期、客户、途径是必填的
        if (!date || !customer || !channel) {
            showNotification('error', '请填写所有必填字段（日期、客户、到店途径）');
            return;
        }
        
        // 如果有选择金额类型但金额为空，显示错误
        if (amountType && amount === 0) {
            showNotification('error', '请填写金额');
            return;
        }
        
        // 如果没有选择金额类型，金额应该为0（或不显示金额输入）
        // 这是允许的，表示无金额的服务记录
        
        // 根据金额类型判断业务逻辑
        let projectNames = '';
        let beauticianAllocations = [];
        let salesBeauticianAllocations = [];
        
        if (amountType) {
            switch(amountType) {
                case '单次消费':
                    // 必须有项目选择
                    if (selectedProjectsInModal.length === 0) {
                        showNotification('error', '请选择服务项目');
                        return;
                    }
                    projectNames = selectedProjectsInModal.map(p => p.name).join(',');
                    beauticianAllocations = getServiceBeauticianAllocations();
                    break;
                    
                case '购卡':
                    // 不需要项目，但必须有销售美容师
                    projectNames = "购卡";
                    salesBeauticianAllocations = getSalesBeauticianAllocations(amount);
                    if (salesBeauticianAllocations.length === 0) {
                        showNotification('error', '请为购卡销售分配美容师');
                        return;
                    }
                    break;
                    
                case '购卡消费':
                    // 必须有项目选择和销售美容师
                    if (selectedProjectsInModal.length === 0) {
                        showNotification('error', '请选择服务项目');
                        return;
                    }
                    projectNames = selectedProjectsInModal.map(p => p.name).join(',');
                    beauticianAllocations = getServiceBeauticianAllocations();
                    salesBeauticianAllocations = getSalesBeauticianAllocations(amount);
                    if (salesBeauticianAllocations.length === 0) {
                        showNotification('error', '请为购卡消费分配销售美容师');
                        return;
                    }
                    break;
            }
        } else {
            // 没有选择金额类型，视为无金额的服务记录
            if (selectedProjectsInModal.length === 0) {
                showNotification('error', '请选择服务项目');
                return;
            }
            projectNames = selectedProjectsInModal.map(p => p.name).join(',');
            beauticianAllocations = getServiceBeauticianAllocations();
        }
        
        // 验证服务美容师分配
        if (beauticianAllocations.length === 0 && (amountType === '单次消费' || amountType === '购卡消费' || !amountType)) {
            showNotification('error', '请为服务项目分配美容师');
            return;
        }
        
        const dateParts = date.split('-');
        const formattedDate = `${parseInt(dateParts[1])}.${parseInt(dateParts[2])}`;
        
        const record = {
            "到店日期": formattedDate,
            "客户名称": customer,
            "项目": projectNames,
            "到店途径": channel,
            "金额": amount,
            "金额类型": amountType || '',
            "美容师分配": beauticianAllocations,
            "销售美容师": salesBeauticianAllocations
        };
        
        if (index === -1) {
            // 新增记录
            yearBusinessData[month].push(record);
            showNotification('success', '记录添加成功');
        } else {
            // 编辑记录
            const data = getFilteredData();
            const originalIndex = yearBusinessData[month].findIndex(item => 
                item.到店日期 === data[index].到店日期 &&
                item.客户名称 === data[index].客户名称 &&
                item.项目 === data[index].项目
            );
            
            if (originalIndex !== -1) {
                yearBusinessData[month][originalIndex] = record;
                showNotification('success', '记录更新成功');
            }
        }
        
        saveDataToLocalStorage();
        closeRecordModal();
        renderTableData();
        updateOverviewData();
        updateBeauticianStats();
        updateCustomerRanking();
        updateCharts();
        
    } catch (error) {
        console.error('保存记录失败:', error);
        showNotification('error', '保存记录失败，请重试');
    }
}

// 添加获取服务美容师分配的函数
function getServiceBeauticianAllocations() {
    const beauticianFeeMap = {};
    let allocationValid = true;
    
    selectedProjectsInModal.forEach(project => {
        const beauticianList = document.getElementById(`beautician-list-${project.id}`);
        if (beauticianList) {
            const beauticianItems = beauticianList.querySelectorAll('.beautician-select');
            
            let hasBeautician = false;
            beauticianItems.forEach(select => {
                if (select.value) {
                    hasBeautician = true;
                    const itemDiv = select.closest('.beautician-assign-item');
                    const manualFeeInput = itemDiv.querySelector('.manual-fee-input');
                    const manualFee = parseFloat(manualFeeInput.value) || 0;
                    
                    // 去重合并逻辑
                    const key = `${select.value}_${project.id}`;
                    if (!beauticianFeeMap[key]) {
                        beauticianFeeMap[key] = {
                            beautician: select.value,
                            manualFee: 0,
                            projectId: project.id,
                            projectName: project.name,
                            beauticianType: "服务"
                        };
                    }
                    beauticianFeeMap[key].manualFee += manualFee;
                }
            });
            
            if (!hasBeautician) {
                allocationValid = false;
                showNotification('error', `请为服务项目"${project.name}"分配美容师`);
            }
        }
    });
    
    if (!allocationValid) return [];
    
    // 将合并后的服务美容师数据添加到分配数组
    const allocations = [];
    Object.values(beauticianFeeMap).forEach(allocation => {
        allocations.push({
            "美容师": allocation.beautician,
            "手工费": allocation.manualFee,
            "业绩百分比": 100,
            "提成比例": 0,
            "美容师类型": "服务",
            "项目ID": allocation.projectId,
            "项目名称": allocation.projectName
        });
    });
    
    return allocations;
}

// 添加获取销售美容师分配的函数
function getSalesBeauticianAllocations(amount) {
    const allocations = [];
    let totalPerformancePercent = 0;
    
    // 获取所有销售美容师项目元素
    const salesList = document.getElementById('salesBeauticianList');
    const salesItems = salesList.querySelectorAll('.sales-beautician-select');
    
    // 如果没有销售美容师，返回空数组
    if (salesItems.length === 0) return [];
    
    salesItems.forEach((select) => {
        if (select.value) {
            const itemDiv = select.closest('[data-sales-id]');
            const performanceInput = itemDiv.querySelector('.sales-performance-percent-input');
            const commissionInput = itemDiv.querySelector('.sales-commission-percent-input');
            
            // 确保获取到正确的百分比值
            const performancePercent = parseFloat(performanceInput.value) || 0;
            const commissionPercent = parseFloat(commissionInput.value) || 0;
            
            totalPerformancePercent += performancePercent;
            
            // 计算业绩金额和提成金额
            const performanceAmount = amount * (performancePercent / 100);
            const commissionAmount = performanceAmount * (commissionPercent / 100);
            
            // 获取美容师信息
            const staff = staffData.find(s => s.name === select.value);
            const commissionRate = staff ? staff.commission : commissionPercent;
            
            allocations.push({
                "美容师": select.value,
                "业绩百分比": performancePercent,
                "提成比例": commissionRate,
                "业绩金额": performanceAmount,
                "提成金额": commissionAmount,
                "美容师类型": "销售"
            });
        }
    });
    
    // 检查业绩百分比总和
    if (allocations.length > 0 && Math.abs(totalPerformancePercent - 100) > 0.01) {
        showNotification('error', `所有销售美容师的业绩百分比总和必须为100%，当前为${totalPerformancePercent.toFixed(1)}%`);
        return [];
    }
    
    return allocations;
}

function bindImportExportEvents() {
    document.getElementById('exportCurrentBtn').addEventListener('click', function() {
        exportData(currentMonth);
    });
    
    document.getElementById('exportAllBtn').addEventListener('click', function() {
        exportAllData();
    });
    
    const importBtn = document.getElementById('importBtn');
    const importModal = document.getElementById('importModal');
    const closeImportModal = document.getElementById('closeImportModal');
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const confirmImportBtn = document.getElementById('confirmImportBtn');
    
    importBtn.addEventListener('click', function() {
        importModal.classList.remove('hidden');
        resetImportModal();
    });
    
    closeImportModal.addEventListener('click', function() {
        importModal.classList.add('hidden');
        resetImportModal();
    });
    
    dropArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    });
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('border-primary', 'bg-primary/5');
    }
    
    function unhighlight() {
        dropArea.classList.remove('border-primary', 'bg-primary/5');
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file) {
            handleFileUpload(file);
        }
    }
    
    confirmImportBtn.addEventListener('click', function() {
        processImportedData();
    });
    
    bindProjectImportEvents();
}

function handleFileUpload(file) {
    if (!file.name.endsWith('.csv')) {
        showNotification('error', '请上传CSV格式的文件');
        return;
    }
    
    const reader = new FileReader();
    const importProgress = document.getElementById('importProgress');
    const progressBar = document.getElementById('progressBar');
    const importStatus = document.getElementById('importStatus');
    const confirmImportBtn = document.getElementById('confirmImportBtn');
    
    importProgress.classList.remove('hidden');
    progressBar.style.width = '30%';
    importStatus.textContent = '正在解析文件...';
    
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const lines = content.split('\n');
            if (lines.length < 2) throw new Error('文件内容为空或格式不正确');
            
            const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
            importedData = [];
            
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                const values = lines[i].split(',').map(val => val.trim());
                const row = {};
                
                headers.forEach((header, index) => {
                    if (header.includes('月份')) row.month = values[index];
                    else if (header.includes('日期')) row.day = values[index];
                    else if (header.includes('客户名称')) row.customer = values[index];
                    else if (header.includes('项目')) row.project = values[index];
                    else if (header.includes('到店途径')) row.channel = values[index];
                    else if (header.includes('金额')) row.amount = values[index];
                    else if (header.includes('美容师分配')) row.beauticianAllocation = values[index];
                });
                
                importedData.push(row);
            }
            
            progressBar.style.width = '80%';
            importStatus.textContent = `解析完成，共发现 ${importedData.length} 条记录`;
            confirmImportBtn.classList.remove('hidden');
            
        } catch (error) {
            showNotification('error', `解析文件失败：${error.message}`);
            resetImportModal();
        }
    };
    
    reader.onerror = function() {
        showNotification('error', '读取文件失败');
        resetImportModal();
    };
    
    reader.readAsText(file);
}

function processImportedData() {
    const progressBar = document.getElementById('progressBar');
    const importStatus = document.getElementById('importStatus');
    const confirmImportBtn = document.getElementById('confirmImportBtn');
    
    progressBar.style.width = '0%';
    importStatus.textContent = '开始导入...';
    confirmImportBtn.classList.add('hidden');
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    const batchSize = 10;
    let currentIndex = 0;
    
    function processBatch() {
        const endIndex = Math.min(currentIndex + batchSize, importedData.length);
        
        for (let i = currentIndex; i < endIndex; i++) {
            try {
                const row = importedData[i];
                
                const month = parseInt(row.month);
                if (isNaN(month) || month < 1 || month > 12) throw new Error(`无效的月份: ${row.month}`);
                
                const day = parseInt(row.day);
                if (isNaN(day) || day < 1 || day > 31) throw new Error(`无效的日期: ${row.day}`);
                
                if (!row.customer) throw new Error('客户名称不能为空');
                if (!row.project) throw new Error('项目不能为空');
                if (!row.channel) throw new Error('到店途径不能为空');
                
                const amount = parseFloat(row.amount) || 0; // 允许为0
                if (amount < 0) throw new Error(`无效的金额: ${row.amount}`);
                
                const beauticianAllocations = [];
                if (row.beauticianAllocation) {
                    const allocations = row.beauticianAllocation.split(';');
                    allocations.forEach(allocation => {
                        if (allocation.trim()) {
                            const parts = allocation.split(':');
                            if (parts.length >= 4) {
                                const beautician = parts[0].trim();
                                const manualFee = parts[1] ? parseFloat(parts[1]) : 0;
                                const percentage = parts[2] ? parseInt(parts[2]) : 100;
                                const commission = parts[3] ? parseFloat(parts[3]) : 3;
                                
                                beauticianAllocations.push({
                                    "美容师": beautician,
                                    "手工费": manualFee || 0,
                                    "业绩百分比": percentage,
                                    "提成比例": commission
                                });
                            }
                        }
                    });
                }
                
                if (beauticianAllocations.length === 0) {
                    beauticianAllocations.push({
                        "美容师": "未知",
                        "手工费": 0,
                        "业绩百分比": 100,
                        "提成比例": 3
                    });
                }
                
                const totalPercentage = beauticianAllocations.reduce((sum, alloc) => sum + alloc.业绩百分比, 0);
                if (amount > 0 && Math.abs(totalPercentage - 100) > 0.01) throw new Error(`美容师分配百分比总和必须为100%，当前为${totalPercentage}%`);
                
                const record = {
                    "到店日期": `${month}.${day}`,
                    "客户名称": row.customer,
                    "项目": row.project,
                    "到店途径": row.channel,
                    "金额": amount,
                    "美容师分配": beauticianAllocations
                };
                
                yearBusinessData[month].push(record);
                successCount++;
                
            } catch (error) {
                errorCount++;
                errors.push(`第 ${i+1} 行: ${error.message}`);
            }
        }
        
        currentIndex = endIndex;
        const progress = Math.round((currentIndex / importedData.length) * 100);
        progressBar.style.width = `${progress}%`;
        importStatus.textContent = `已导入 ${currentIndex}/${importedData.length} 条记录`;
        
        if (currentIndex < importedData.length) {
            setTimeout(processBatch, 50);
        } else {
            progressBar.style.width = '100%';
            importStatus.textContent = `导入完成：成功 ${successCount} 条，失败 ${errorCount} 条`;
            
            saveDataToLocalStorage();
            renderTableData();
            updateOverviewData();
            updateBeauticianStats();
            updateCustomerRanking();
            updateCharts();
            
            if (errorCount > 0) {
                showNotification('info', `导入完成，成功 ${successCount} 条，失败 ${errorCount} 条`);
            } else {
                showNotification('success', `成功导入 ${successCount} 条记录`);
            }
            
            setTimeout(() => {
                document.getElementById('importModal').classList.add('hidden');
                resetImportModal();
            }, 1500);
        }
    }
    
    processBatch();
}

function resetImportModal() {
    document.getElementById('fileInput').value = '';
    document.getElementById('importProgress').classList.add('hidden');
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('importStatus').textContent = '准备导入...';
    document.getElementById('confirmImportBtn').classList.add('hidden');
    importedData = [];
}

function exportData(month) {
    const data = yearBusinessData[month] || [];
    if (data.length === 0) {
        showNotification('info', `第 ${month} 月没有可导出的数据`);
        return;
    }
    
    let csvContent = "月份,日期,客户名称,项目,到店途径,金额,美容师分配\n";
    
    data.forEach(record => {
        const [m, d] = record.到店日期.split('.');
        const allocationStr = record.美容师分配.map(alloc => 
            `${alloc.项目ID || 'unknown'}:${alloc.美容师}:${alloc.手工费}:${alloc.业绩百分比}:${alloc.提成比例 || 3}`
        ).join(';');
        
        const row = [
            m,
            d,
            `"${record.客户名称.replace(/"/g, '""')}"`,
            `"${record.项目.replace(/"/g, '""')}"`,
            record.到店途径,
            record.金额,
            `"${allocationStr}"`
        ];
        
        csvContent += row.join(',') + "\n";
    });
    
    downloadCSV(csvContent, `业务数据_${month}月.csv`);
}

function exportAllData() {
    let csvContent = "月份,日期,客户名称,项目,到店途径,金额,美容师分配\n";
    let totalRecords = 0;
    
    for (let month = 1; month <= 12; month++) {
        const data = yearBusinessData[month] || [];
        totalRecords += data.length;
        
        data.forEach(record => {
            const [m, d] = record.到店日期.split('.');
            const allocationStr = record.美容师分配.map(alloc => 
                `${alloc.项目ID || 'unknown'}:${alloc.美容师}:${alloc.手工费}:${alloc.业绩百分比}:${alloc.提成比例 || 3}`
            ).join(';');
            
            const row = [
                m,
                d,
                `"${record.客户名称.replace(/"/g, '""')}"`,
                `"${record.项目.replace(/"/g, '""')}"`,
                record.到店途径,
                record.金额,
                `"${allocationStr}"`
            ];
            
            csvContent += row.join(',') + "\n";
        });
    }
    
    if (totalRecords === 0) {
        showNotification('info', '没有可导出的全年数据');
        return;
    }
    
    downloadCSV(csvContent, `业务数据_全年.csv`);
}

function downloadCSV(content, filename) {
    try {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, filename);
        } else {
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        showNotification('success', `文件已导出: ${filename}`);
    } catch (error) {
        console.error('导出文件失败:', error);
        showNotification('error', '导出文件失败，请重试');
    }
}

function updateMonthView(month) {
    try {
        currentMonth = month;
        currentPage = 1;
        
        document.querySelectorAll('.month-btn').forEach(btn => {
            if (parseInt(btn.dataset.month) === currentMonth) {
                btn.classList.add('month-active');
                btn.classList.remove('bg-gray-100', 'hover:bg-gray-200');
            } else {
                btn.classList.remove('month-active');
                btn.classList.add('bg-gray-100', 'hover:bg-gray-200');
            }
        });
        
        renderTableData();
        updateOverviewData();
        updateBeauticianStats();
        updateCustomerRanking();
        updateCharts();
    } catch (error) {
        console.error('更新月份视图失败:', error);
        showNotification('error', '切换月份失败，请重试');
    }
}

// 修改渲染表格数据的函数
function renderTableData() {
    const tableBody = document.getElementById('tableBody');
    const data = getFilteredData();
    
    document.getElementById('totalItems').textContent = data.length;
    const totalPages = Math.ceil(data.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, data.length);
    const paginatedData = data.slice(startIndex, endIndex);
    
    document.getElementById('currentPageRange').textContent = `${startIndex + 1} 到 ${endIndex}`;
    tableBody.innerHTML = '';
    
    if (paginatedData.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="11" class="px-4 py-8 text-center text-gray-500">没有找到匹配的记录</td>`;
        tableBody.appendChild(emptyRow);
    } else {
        paginatedData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-gray-50 cell-transition';
            
            const originalIndex = data.findIndex(d => 
                d.到店日期 === item.到店日期 && 
                d.客户名称 === item.客户名称 && 
                d.项目 === item.项目
            );
            
            // 服务美容师信息和手工费 - 过滤掉销售美容师，并进行合并去重
            const serviceBeauticians = {};
            item.美容师分配
                .filter(alloc => !alloc.美容师类型 || alloc.美容师类型 === '服务')
                .forEach(alloc => {
                    const beauticianName = alloc.美容师;
                    if (beauticianName) {
                        if (!serviceBeauticians[beauticianName]) {
                            serviceBeauticians[beauticianName] = {
                                name: beauticianName,
                                manualFee: 0,
                                type: '服务'
                            };
                        }
                        serviceBeauticians[beauticianName].manualFee += alloc.手工费 || 0;
                    }
                });
            
            // 转换为数组
            const serviceBeauticiansArray = Object.values(serviceBeauticians);
            // 销售美容师信息 - 从不同的字段获取
            let salesBeauticians = [];
            // 1. 尝试从单独的销售美容师字段获取
            if (item.销售美容师 && item.销售美容师.length > 0) {
                salesBeauticians = item.销售美容师.map(sales => {
                    return {
                        name: sales.美容师,
                        performancePercent: sales.业绩百分比 || 0,
                        performanceAmount: sales.业绩金额 || 0,
                        commissionPercent: sales.提成比例 || 0,
                        commissionAmount: sales.提成金额 || 0,
                        type: '销售'
                    };
                });
            } 
            // 2. 如果没有单独字段，尝试从美容师分配中过滤销售美容师
            else if (item.美容师分配 && item.美容师分配.length > 0) {
                salesBeauticians = item.美容师分配
                    .filter(alloc => alloc.美容师类型 === '销售')
                    .map(sales => {
                        return {
                            name: sales.美容师,
                            performancePercent: sales.业绩百分比 || 0,
                            performanceAmount: (amount || 0) * (sales.业绩百分比 || 0) / 100,
                            commissionPercent: sales.提成比例 || 0,
                            commissionAmount: ((amount || 0) * (sales.业绩百分比 || 0) / 100) * (sales.提成比例 || 0) / 100,
                            type: '销售'
                        };
                    });
            }
            
            row.innerHTML = `
                <td class="px-4 py-3">${item.到店日期}</td>
                <td class="px-4 py-3">${item.客户名称}</td>
                <td class="px-4 py-3">${item.项目}</td>
                <td class="px-4 py-3">${item.到店途径}</td>
                <td class="px-4 py-3 font-medium">${formatCurrency(item.金额)}</td>
                <td class="px-4 py-3 multi-beautician-cell">
                    ${serviceBeauticiansArray.length > 0 ? 
                        serviceBeauticiansArray.map(info => `<div>${info.name}</div>`).join('') : 
                        '<div class="text-gray-400 text-sm">无</div>'}
                </td>
                <td class="px-4 py-3 multi-beautician-cell">
                    ${serviceBeauticiansArray.length > 0 ? 
                        serviceBeauticiansArray.map(info => `<div class="text-blue-600">¥${info.manualFee.toFixed(2)}</div>`).join('') : 
                        '<div class="text-gray-400 text-sm">¥0.00</div>'}
                </td>
                <td class="px-4 py-3 multi-beautician-cell">
                    ${salesBeauticians.length > 0 ? 
                        salesBeauticians.map(info => `<div>${info.name}</div>`).join('') : 
                        '<div class="text-gray-400 text-sm">无</div>'}
                </td>
                <td class="px-4 py-3 multi-beautician-cell">
                    ${salesBeauticians.length > 0 ? 
                        salesBeauticians.map(info => `
                            <div class="text-green-600">
                                ${info.performancePercent}% / ¥${info.performanceAmount.toFixed(2)}
                            </div>
                        `).join('') : 
                        '<div class="text-gray-400 text-sm">¥0.00</div>'}
                </td>
                <td class="px-4 py-3 multi-beautician-cell">
                    ${salesBeauticians.length > 0 ? 
                        salesBeauticians.map(info => `
                            <div class="text-accent">
                                ${info.commissionPercent}% / ¥${info.commissionAmount.toFixed(2)}
                            </div>
                        `).join('') : 
                        '<div class="text-gray-400 text-sm">¥0.00</div>'}
                </td>
                <td class="px-4 py-3">
                    <div class="flex space-x-2">
                        <button class="edit-btn text-primary hover:text-primary/80" data-index="${originalIndex}">
                            <i class="fa fa-pencil"></i>
                        </button>
                        <button class="delete-btn text-red-500 hover:text-red-700" data-index="${originalIndex}">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
                            
            tableBody.appendChild(row);
        });
    }
    
    renderPagination(totalPages);
    bindTableActionButtons();
}

function bindTableActionButtons() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            openRecordModal(index);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            if (confirm('确定要删除这条记录吗？')) {
                deleteRecord(index);
            }
        });
    });
}

function deleteRecord(index) {
    const data = getFilteredData();
    const recordToDelete = data[index];
    
    const originalIndex = yearBusinessData[currentMonth].findIndex(item => 
        item.到店日期 === recordToDelete.到店日期 &&
        item.客户名称 === recordToDelete.客户名称 &&
        item.项目 === recordToDelete.项目
    );
    
    if (originalIndex !== -1) {
        yearBusinessData[currentMonth].splice(originalIndex, 1);
        saveDataToLocalStorage();
        renderTableData();
        updateOverviewData();
        updateBeauticianStats();
        updateCustomerRanking();
        updateCharts();
        showNotification('success', '记录已删除');
    }
}

function bindPaginationEvents() {
    document.getElementById('prevPage').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderTableData();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', function() {
        const totalPages = Math.ceil(getFilteredData().length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            renderTableData();
        }
    });
    
    document.getElementById('prevPageMobile').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderTableData();
        }
    });
    
    document.getElementById('nextPageMobile').addEventListener('click', function() {
        const totalPages = Math.ceil(getFilteredData().length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            renderTableData();
        }
    });
}

function bindSearchEvent() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        searchKeyword = this.value.trim();
        currentPage = 1;
        renderTableData();
    });
}

function getFilteredData() {
    let data = yearBusinessData[currentMonth] || [];
    
    if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        data = data.filter(item => 
            item.客户名称.toLowerCase().includes(keyword) ||
            item.项目.toLowerCase().includes(keyword) ||
            item.到店途径.toLowerCase().includes(keyword) ||
            item.美容师分配.some(alloc => alloc.美容师.toLowerCase().includes(keyword))
        );
    }
    
    return data;
}

function renderPagination(totalPages) {
    const paginationContainer = document.getElementById('paginationNumbers');
    paginationContainer.innerHTML = '';
    
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('prevPageMobile').disabled = currentPage === 1;
    if (currentPage === 1) {
        document.getElementById('prevPage').classList.add('opacity-50', 'cursor-not-allowed');
        document.getElementById('prevPageMobile').classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        document.getElementById('prevPage').classList.remove('opacity-50', 'cursor-not-allowed');
        document.getElementById('prevPageMobile').classList.remove('opacity-50', 'cursor-not-allowed');
    }
    
    document.getElementById('nextPage').disabled = currentPage === totalPages || totalPages === 0;
    document.getElementById('nextPageMobile').disabled = currentPage === totalPages || totalPages === 0;
    if (currentPage === totalPages || totalPages === 0) {
        document.getElementById('nextPage').classList.add('opacity-50', 'cursor-not-allowed');
        document.getElementById('nextPageMobile').classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        document.getElementById('nextPage').classList.remove('opacity-50', 'cursor-not-allowed');
        document.getElementById('nextPageMobile').classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

function updateOverviewData() {
    const currentData = yearBusinessData[currentMonth] || [];
    
    document.getElementById('monthRecords').textContent = currentData.length;
    
    const monthCustomers = [...new Set(currentData.map(item => item.客户名称))];
    document.getElementById('monthCustomers').textContent = monthCustomers.length;
    
    let allCustomers = [];
    for (let month in yearBusinessData) {
        allCustomers = [...allCustomers, ...yearBusinessData[month].map(item => item.客户名称)];
    }
    const uniqueCustomers = [...new Set(allCustomers)];
    document.getElementById('totalCustomers').textContent = uniqueCustomers.length;
    
    // 计算月营业额并格式化显示
    const monthRevenue = currentData.reduce((sum, item) => sum + (item.金额 || 0), 0);
    document.getElementById('monthRevenue').textContent = formatCurrency(monthRevenue);
    
    // 计算年总营业额并格式化显示
    let yearRevenue = 0;
    for (let month in yearBusinessData) {
        yearRevenue += yearBusinessData[month].reduce((sum, item) => sum + (item.金额 || 0), 0);
    }
    document.getElementById('yearRevenue').textContent = formatCurrency(yearRevenue);
    
    // 计算较上月增长率（使用原始金额计算）
    const prevMonth = currentMonth > 1 ? currentMonth - 1 : 12;
    const prevMonthRevenue = (yearBusinessData[prevMonth] || []).reduce((sum, item) => sum + (item.金額 || 0), 0);
    
    const revenueChangeEl = document.getElementById('monthRevenueChange');
    if (prevMonthRevenue === 0 && monthRevenue > 0) {
        revenueChangeEl.innerHTML = '<i class="fa fa-arrow-up mr-1"></i> 较上月增长100%';
        revenueChangeEl.className = 'mt-4 text-sm text-green-600 flex items-center';
    } else if (prevMonthRevenue === 0 && monthRevenue === 0) {
        revenueChangeEl.innerHTML = '<i class="fa fa-minus mr-1"></i> 较上月无变化';
        revenueChangeEl.className = 'mt-4 text-sm text-gray-600 flex items-center';
    } else if (prevMonthRevenue > 0) {
        const changePercent = ((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
        if (Math.abs(changePercent) < 0.1) {
            revenueChangeEl.innerHTML = '<i class="fa fa-minus mr-1"></i> 较上月基本持平';
            revenueChangeEl.className = 'mt-4 text-sm text-gray-600 flex items-center';
        } else if (changePercent >= 0) {
            revenueChangeEl.innerHTML = `<i class="fa fa-arrow-up mr-1"></i> 较上月增长${Math.abs(changePercent).toFixed(1)}%`;
            revenueChangeEl.className = 'mt-4 text-sm text-green-600 flex items-center';
        } else {
            revenueChangeEl.innerHTML = `<i class="fa fa-arrow-down mr-1"></i> 较上月下降${Math.abs(changePercent).toFixed(1)}%`;
            revenueChangeEl.className = 'mt-4 text-sm text-red-600 flex items-center';
        }
    }
}
// 修改 updateBeauticianStats 函数
function updateBeauticianStats() {
    const currentData = yearBusinessData[currentMonth] || [];
    const statsBody = document.getElementById('beauticianStatsBody');
    statsBody.innerHTML = '';
    
    const stats = {};
    const serviceRecords = new Set();
    
    currentData.forEach(item => {
        // 处理服务美容师 - 使用对象进行去重合并
        const serviceBeauticianFees = {};
        
        item.美容师分配.forEach(alloc => {
            const beauticianName = alloc.美容师;
            if (!beauticianName) return;
            
            // 只处理类型为"服务"或未指定的美容师（排除销售美容师）
            if (alloc.美容师类型 && alloc.美容师类型 === '销售') {
                return; // 跳过销售美容师的服务分配
            }
            
            // 去重合并手工费
            if (!serviceBeauticianFees[beauticianName]) {
                serviceBeauticianFees[beauticianName] = 0;
            }
            serviceBeauticianFees[beauticianName] += alloc.手工费 || 0;
        });
        
        // 将合并后的数据添加到统计中
        Object.entries(serviceBeauticianFees).forEach(([beauticianName, manualFee]) => {
            if (!stats[beauticianName]) {
                stats[beauticianName] = {
                    totalManualFee: 0,
                    totalPerformance: 0,
                    serviceCount: 0,
                    totalCommission: 0
                };
            }
            
            stats[beauticianName].totalManualFee += manualFee;
            
            // 使用唯一的服务记录键来避免重复计数
            const serviceRecordKey = `${item.客户名称}_${beauticianName}_${item.到店日期}`;
            if (!serviceRecords.has(serviceRecordKey)) {
                stats[beauticianName].serviceCount += 1;
                serviceRecords.add(serviceRecordKey);
            }
        });
        
        // 处理销售美容师 - 只计算业绩和提成
        if (item.销售美容师 && item.销售美容师.length > 0) {
            item.销售美容师.forEach(sales => {
                const beauticianName = sales.美容师;
                if (!beauticianName) return;
                
                if (!stats[beauticianName]) {
                    stats[beauticianName] = {
                        totalManualFee: 0,
                        totalPerformance: 0,
                        serviceCount: 0,
                        totalCommission: 0
                    };
                }
                
                // 累加销售业绩（注意：这是销售业绩，不是手工费）
                const performanceAmount = sales.业绩金额 || 0;
                stats[beauticianName].totalPerformance += performanceAmount;
                
                // 累加销售提成
                const commissionAmount = sales.提成金额 || 0;
                stats[beauticianName].totalCommission += commissionAmount;
            });
        }
    });
    
    // 转换为数组并按总业绩排序（销售业绩 + 手工费）
    const sortedStats = Object.entries(stats)
        .map(([name, stat]) => ({
            name,
            totalManualFee: stat.totalManualFee,
            totalPerformance: stat.totalPerformance,
            serviceCount: stat.serviceCount,
            totalCommission: parseFloat(stat.totalCommission.toFixed(2)) // 四舍五入到2位小数
        }))
        .sort((a, b) => {
            // 按总收入排序（业绩 + 手工费 + 提成）
            const totalA = a.totalPerformance + a.totalManualFee + a.totalCommission;
            const totalB = b.totalPerformance + b.totalManualFee + b.totalCommission;
            return totalB - totalA;
        });
    
    // 渲染统计表格
    sortedStats.forEach(stat => {
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-gray-50 cell-transition';
        
        // 确定美容师角色标签
        // let roleLabel = '';
        // if (stat.totalPerformance > 0 && stat.totalManualFee > 0) {
        //     roleLabel = '<span class="text-xs text-accent ml-1">(销售+服务)</span>';
        // } else if (stat.totalPerformance > 0) {
        //     roleLabel = '<span class="text-xs text-green-600 ml-1">(销售)</span>';
        // } else if (stat.totalManualFee > 0) {
        //     roleLabel = '<span class="text-xs text-blue-600 ml-1">(服务)</span>';
        // }
        // <td class="px-4 py-3 font-medium">${stat.name}${roleLabel}</td>
        row.innerHTML = `
            <td class="px-4 py-3 font-medium">${stat.name}</td>
            <td class="px-4 py-3">${formatCurrency(stat.totalManualFee)}</td>
            <td class="px-4 py-3 font-medium">${formatCurrency(stat.totalPerformance)}</td>
            <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${stat.serviceCount} 次
                </span>
            </td>
            <td class="px-4 py-3 font-medium text-green-600">${formatCurrency(stat.totalCommission)}</td>
        `;
        statsBody.appendChild(row);
    });
    
    if (sortedStats.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="5" class="px-4 py-8 text-center text-gray-500">本月暂无业绩数据</td>`;
        statsBody.appendChild(emptyRow);
    }
}

function updateCustomerRanking() {
    const rankingBody = document.getElementById('customerRankingBody');
    rankingBody.innerHTML = '';
    
    const customerStats = {};
    
    for (let month in yearBusinessData) {
        yearBusinessData[month].forEach(item => {
            const name = item.客户名称;
            if (!customerStats[name]) {
                customerStats[name] = {
                    totalSpending: 0,
                    visitCount: 0
                };
            }
            
            customerStats[name].totalSpending += item.金额 || 0;
            customerStats[name].visitCount += 1;
        });
    }
    
    const sortedCustomers = Object.entries(customerStats)
        .map(([name, stats]) => ({
            name,
            totalSpending: stats.totalSpending,
            visitCount: stats.visitCount,
            avgSpending: stats.totalSpending / stats.visitCount
        }))
        .sort((a, b) => b.totalSpending - a.totalSpending);
    
    const topCustomers = sortedCustomers.slice(0, 10);
    
    // 确保有足够的客户数据
    console.log('Top customers for chart:', sortedCustomers.slice(0, 5));
    
    topCustomers.forEach((customer, index) => {
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-gray-50 cell-transition';
        
        // 在客户排名中
        row.innerHTML = `
            <td class="px-4 py-3">
                <div class="beautiful-rank-circle ${
                    index === 0 ? 'rank-1' : 
                    index === 1 ? 'rank-2' : 
                    index === 2 ? 'rank-3' : 
                    'rank-other'
                }">
                    ${index + 1}
                </div>
            </td>
            <td class="px-4 py-3 font-medium text-gray-800">${customer.name}</td>
            <td class="px-4 py-3 font-bold text-primary text-lg">${formatCurrency(customer.totalSpending)}</td>
            <td class="px-4 py-3">
                <span class="visit-badge">
                    <i class="fa fa-calendar-check-o"></i>${customer.visitCount}次
                </span>
            </td>
            <td class="px-4 py-3 font-medium text-secondary text-lg">${formatCurrency(customer.avgSpending)}</td>
        `;
        rankingBody.appendChild(row);
    });
    
    if (sortedCustomers.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="5" class="px-4 py-8 text-center text-gray-500">暂无客户消费数据</td>`;
        rankingBody.appendChild(emptyRow);
    }
    
    // 更新图表数据 - 确保至少有数据
    const chartData = sortedCustomers.slice(0, 5);
    console.log('Chart data:', chartData);
    updateTopCustomersChart(chartData);
}
function updateTopCustomersChart(topCustomers) {
    if (!window.topCustomersChart) {
        console.error('Top customers chart not initialized');
        return;
    }
    
    // 如果没有客户数据，显示空状态
    if (!topCustomers || topCustomers.length === 0) {
        console.log('No customer data for chart');
        window.topCustomersChart.data.labels = ['暂无数据'];
        window.topCustomersChart.data.datasets[0].data = [1];
        window.topCustomersChart.data.datasets[0].backgroundColor = ['#e5e7eb']; // 灰色
        
        // 更新 tooltip 配置为空数据状态
        window.topCustomersChart.options.plugins.tooltip = {
            callbacks: {
                label: function(context) {
                    return '暂无客户数据';
                }
            }
        };
        
        window.topCustomersChart.update();
        return;
    }
    
    // 确保数据格式正确
    const labels = topCustomers.map(c => c.name || '未知客户');
    const data = topCustomers.map(c => c.totalSpending || 0);
    
    console.log('Updating chart with:', { labels, data });
    
    // 使用预设颜色，确保颜色数量足够
    const chartColors = ['#A23B72', '#2E86AB', '#F18F01', '#4CAF50', '#FF5722', '#9C27B0'];
    
    window.topCustomersChart.data.labels = labels;
    window.topCustomersChart.data.datasets[0].data = data;
    window.topCustomersChart.data.datasets[0].backgroundColor = chartColors.slice(0, topCustomers.length);
    
    // 更新 tooltip 配置
    window.topCustomersChart.options.plugins.tooltip = {
        callbacks: {
            label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return `${label}: ${formatCurrency(value)} (${percentage}%)`;
            }
        }
    };
    
    window.topCustomersChart.update();
}
function bindStaffManagementEvents() {
    const staffBtn = document.getElementById('staffBtn');
    const staffModal = document.getElementById('staffModal');
    const closeStaffModal = document.getElementById('closeStaffModal');
    const addStaffBtn = document.getElementById('addStaffBtn');
    const staffForm = document.getElementById('staffForm');
    const cancelStaffBtn = document.getElementById('cancelStaffBtn');
    const saveStaffBtn = document.getElementById('saveStaffBtn');
    
    staffBtn.addEventListener('click', function() {
        staffModal.classList.remove('hidden');
        staffForm.classList.add('hidden');
    });
    
    closeStaffModal.addEventListener('click', function() {
        staffModal.classList.add('hidden');
        staffForm.reset();
    });
    
    addStaffBtn.addEventListener('click', function() {
        staffForm.classList.remove('hidden');
        staffForm.reset();
    });
    
    cancelStaffBtn.addEventListener('click', function() {
        staffForm.classList.add('hidden');
        staffForm.reset();
    });
    
    saveStaffBtn.addEventListener('click', function() {
        const name = document.getElementById('staffName').value.trim();
        const position = document.getElementById('staffPosition').value;
        
        if (!name) {
            showNotification('error', '请输入员工姓名');
            return;
        }
        
        if (staffData.some(staff => staff.name === name)) {
            showNotification('error', '已存在同名员工');
            return;
        }
        
        const newStaff = {
            id: Date.now(),
            name: name,
            position: position,
            commission: 3
        };
        
        staffData.push(newStaff);
        saveDataToLocalStorage();
        renderStaffList();
        staffForm.classList.add('hidden');
        staffForm.reset();
        showNotification('success', '员工添加成功');
    });
}

function renderStaffList() {
    const staffListEl = document.getElementById('staffList');
    staffListEl.innerHTML = '';
    
    const beauticians = staffData.filter(staff => 
        staff.position === '美容师' || staff.position === '理疗师'
    );
    
    if (beauticians.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'text-center text-gray-500 py-2';
        emptyItem.textContent = '暂无员工数据';
        staffListEl.appendChild(emptyItem);
    } else {
        beauticians.forEach(staff => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center p-2 hover:bg-gray-50 rounded';
            li.innerHTML = `
                <span>${staff.name} (${staff.position})</span>
                <button class="delete-staff text-red-500 hover:text-red-700" data-id="${staff.id}">
                    <i class="fa fa-times"></i>
                </button>
            `;
            staffListEl.appendChild(li);
        });
    }
    
    document.querySelectorAll('.delete-staff').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            deleteStaff(id);
        });
    });
}

function deleteStaff(id) {
    if (confirm('确定要删除该员工吗？相关记录不会被删除。')) {
        staffData = staffData.filter(staff => staff.id !== id);
        saveDataToLocalStorage();
        renderStaffList();
        showNotification('success', '员工已删除');
    }
}

function bindSaveDataButton() {
    document.getElementById('saveBtn').addEventListener('click', function() {
        saveDataToLocalStorage();
        showNotification('success', '数据已保存');
    });
}

function saveDataToLocalStorage() {
    localStorage.setItem('staffData', JSON.stringify(staffData));
    localStorage.setItem('projectTypes', JSON.stringify(projectTypes));
    localStorage.setItem('projectsData', JSON.stringify(projectsData));
    localStorage.setItem('yearBusinessData', JSON.stringify(yearBusinessData));
}

function initCharts() {
    const serviceTypeCtx = document.getElementById('serviceTypeChart').getContext('2d');
    window.serviceTypeChart = new Chart(serviceTypeCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: ['#A23B72', '#2E86AB', '#F18F01', '#4CAF50', '#FF5722', '#9C27B0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right' } }
        }
    });
    
    const monthlyTrendCtx = document.getElementById('monthlyTrendChart').getContext('2d');
    window.monthlyTrendChart = new Chart(monthlyTrendCtx, {
        type: 'line',
        data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            datasets: [{
                label: '营业额',
                data: new Array(12).fill(0),
                borderColor: '#A23B72',
                backgroundColor: 'rgba(162, 59, 114, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: function(value) { return formatCurrency(value);} }
                }
            }
        }
    });
    
    const arrivalChannelCtx = document.getElementById('arrivalChannelChart').getContext('2d');
    window.arrivalChannelChart = new Chart(arrivalChannelCtx, {
        type: 'pie',
        data: {
            labels: ["会员", "抖音", "美团", "现场散客", "转介绍"], // 更新标签
            datasets: [{
                data: new Array(5).fill(0), // 更新数组长度
                backgroundColor: ['#A23B72', '#2E86AB', '#F18F01', '#4CAF50', '#FF5722'], // 更新颜色
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
    
    const topCustomersCtx = document.getElementById('topCustomersChart').getContext('2d');
    window.topCustomersChart = new Chart(topCustomersCtx, {
        type: 'pie',
        data: {
            labels: ['等待数据...'],
            datasets: [{
                data: [100],
                backgroundColor: ['#e5e7eb'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 12,
                            family: 'Inter'
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            
                            // 使用 formatCurrency 函数，确保它在调用之前已经定义
                            if (typeof formatCurrency === 'function') {
                                return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                            } else {
                                return `${label}: ¥${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        }
    });
}

function updateCharts() {
    updateServiceTypeChart();
    updateMonthlyTrendChart();
    updateArrivalChannelChart();
}

function updateServiceTypeChart() {
    if (!window.serviceTypeChart) return;
    
    const currentData = yearBusinessData[currentMonth] || [];
    const projectStats = {};
    
    currentData.forEach(item => {
        // 检查是否有服务美容师（美容师分配中类型为"服务"或者没有指定类型但不是销售）
        const hasServiceBeautician = item.美容师分配 && 
            item.美容师分配.some(alloc => 
                !alloc.美容师类型 || 
                alloc.美容师类型 === '服务'
            );
        
        // 如果没有服务美容师，跳过统计
        if (!hasServiceBeautician) return;
        
        const projects = item.项目.split(',').map(p => p.trim()).filter(p => p);
        
        // 过滤掉"交款"、"登记"等非服务项目
        const serviceProjects = projects.filter(project => 
            project !== "交款" && 
            project !== "登记" && 
            project !== "咨询"
        );
        
        // 如果没有服务项目，跳过
        if (serviceProjects.length === 0) return;
        
        serviceProjects.forEach(project => {
            if (!projectStats[project]) projectStats[project] = 0;
            projectStats[project] += 1;
        });
    });
    
    const labels = Object.keys(projectStats);
    const data = Object.values(projectStats);
    
    // 如果没有服务项目数据，显示空状态
    if (labels.length === 0) {
        window.serviceTypeChart.data.labels = ['暂无服务项目'];
        window.serviceTypeChart.data.datasets[0].data = [1];
        window.serviceTypeChart.data.datasets[0].backgroundColor = ['#e5e7eb'];
    } else {
        window.serviceTypeChart.data.labels = labels;
        window.serviceTypeChart.data.datasets[0].data = data;
        window.serviceTypeChart.data.datasets[0].backgroundColor = ['#A23B72', '#2E86AB', '#F18F01', '#4CAF50', '#FF5722', '#9C27B0'];
    }
    
    window.serviceTypeChart.update();
}

function updateMonthlyTrendChart() {
    if (!window.monthlyTrendChart) return;
    
    const monthlyData = [];
    for (let i = 1; i <= 12; i++) {
        const revenue = (yearBusinessData[i] || []).reduce((sum, item) => sum + (item.金额 || 0), 0);
        monthlyData.push(revenue);
    }
    
    window.monthlyTrendChart.data.datasets[0].data = monthlyData;
    window.monthlyTrendChart.update();
}

function updateArrivalChannelChart() {
    if (!window.arrivalChannelChart) return;
    
    const currentData = yearBusinessData[currentMonth] || [];
    // const channelStats = arrivalChannels.reduce((obj, channel) => {
    //     obj[channel] = 0;
    //     return obj;
    // }, {});
    const channelStats = {
        "会员": 0,
        "抖音": 0,
        "美团": 0,
        "现场散客": 0,
        "转介绍": 0
    };
    
    currentData.forEach(item => {
        if (channelStats.hasOwnProperty(item.到店途径)) {
            channelStats[item.到店途径] += 1;
        }
    });
    
    window.arrivalChannelChart.data.labels = Object.keys(channelStats);
    window.arrivalChannelChart.data.datasets[0].data = Object.values(channelStats);
    window.arrivalChannelChart.update();
}

function showNotification(type, message) {
    const notification = document.getElementById('notification');
    const icon = document.getElementById('notificationIcon');
    const text = document.getElementById('notificationText');
    
    if (type === 'success') {
        notification.className = 'fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg transform translate-y-0 opacity-100 transition-all duration-300 flex items-center max-w-xs bg-green-50 border-l-4 border-green-500';
        icon.className = 'fa fa-check-circle mr-3 text-xl text-green-500';
    } else if (type === 'error') {
        notification.className = 'fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg transform translate-y-0 opacity-100 transition-all duration-300 flex items-center max-w-xs bg-red-50 border-l-4 border-red-500';
        icon.className = 'fa fa-exclamation-circle mr-3 text-xl text-red-500';
    } else if (type === 'info') {
        notification.className = 'fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg transform translate-y-0 opacity-100 transition-all duration-300 flex items-center max-w-xs bg-blue-50 border-l-4 border-blue-500';
        icon.className = 'fa fa-info-circle mr-3 text-xl text-blue-500';
    }
    
    text.textContent = message;
    
    setTimeout(() => {
        notification.className = 'fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg transform translate-y-20 opacity-0 transition-all duration-300 flex items-center max-w-xs';
    }, 3000);
}
// 添加一个通用的重试函数
function retryOperation(operation, maxRetries = 3, delay = 100) {
    return new Promise((resolve, reject) => {
        let retries = 0;
        
        function attempt() {
            try {
                const result = operation();
                resolve(result);
            } catch (error) {
                retries++;
                if (retries < maxRetries) {
                    setTimeout(attempt, delay * retries);
                } else {
                    reject(error);
                }
            }
        }
        
        attempt();
    });
}
// 金额格式化函数
function formatCurrency(amount) {
    if (typeof amount !== 'number') {
        amount = parseFloat(amount) || 0;
    }
    
    // 如果金额小于1万，直接显示两位小数
    if (amount < 10000) {
        return '¥' + amount.toFixed(2);
    }
    
    // 如果金额在1万到1亿之间，显示为xx.xx万
    if (amount < 100000000) {
        const wan = amount / 10000;
        return '¥' + wan.toFixed(2) + '万';
    }
    
    // 如果金额大于等于1亿，显示为xx.xx亿
    const yi = amount / 100000000;
    return '¥' + yi.toFixed(2) + '亿';
}

// 添加辅助函数获取原始金额（用于计算百分比等）
function getOriginalAmount(formattedAmount) {
    if (!formattedAmount) return 0;
    
    if (formattedAmount.includes('亿')) {
        const yi = parseFloat(formattedAmount.replace('¥', '').replace('亿', ''));
        return yi * 100000000;
    } else if (formattedAmount.includes('万')) {
        const wan = parseFloat(formattedAmount.replace('¥', '').replace('万', ''));
        return wan * 10000;
    } else {
        return parseFloat(formattedAmount.replace('¥', '')) || 0;
    }
}
