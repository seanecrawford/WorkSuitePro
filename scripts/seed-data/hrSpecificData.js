import { faker } from '@faker-js/faker';
import { supabase, batchInsert, DEPARTMENTS, EMPLOYMENT_CATEGORIES, EMPLOYMENT_STATUSES, LEAVE_TYPES, LEAVE_STATUSES, PAYROLL_STATUSES, BENEFIT_TYPES, DOCUMENT_TYPES } from '../seed-utils.js'; // Adjusted path

async function fetchPersonnelUUIDs(count = 20, progressCallback = () => {}) {
    progressCallback("Fetching personnel UUIDs for HR data linking...");
    const { data, error } = await supabase
        .from('personnel')
        .select('personnel_uuid, name, role, department, datejoined') // Added datejoined
        .limit(count * 2); 

    if (error) {
        progressCallback(`Error fetching personnel UUIDs: ${error.message}`);
        throw error;
    }
    if (!data || data.length === 0) {
        progressCallback("No personnel found to link HR data to. Seeding will be limited.");
        return [];
    }
    progressCallback(`Fetched ${data.length} personnel records.`);
    return data;
}

export async function seedLeaveRequests(count = 50, personnelList, progressCallback = () => {}) {
    if (!personnelList || personnelList.length === 0) {
        progressCallback("Skipping leave requests: No personnel available.");
        return [];
    }
    progressCallback(`Starting to seed ${count} leave requests...`);
    const leaveRequestsData = [];
    for (let i = 0; i < count; i++) {
        const employee = faker.helpers.arrayElement(personnelList);
        const startDate = faker.date.recent({ days: 90 });
        const endDate = faker.date.future({ days: 10, refDate: startDate });
        leaveRequestsData.push({
            employee_id: employee.personnel_uuid,
            leave_type: faker.helpers.arrayElement(LEAVE_TYPES),
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            reason: faker.lorem.sentence(),
            status: faker.helpers.arrayElement(LEAVE_STATUSES),
            approved_by: faker.datatype.boolean(0.7) ? faker.helpers.arrayElement(personnelList).personnel_uuid : null,
            requested_at: faker.date.recent({ days: 95, refDate: startDate }).toISOString(),
        });
    }
    await batchInsert('leave_requests', leaveRequestsData, progressCallback);
    progressCallback('Leave requests seeding complete.');
    return leaveRequestsData;
}

export async function seedPayrollData(count = 50, personnelList, progressCallback = () => {}) {
    if (!personnelList || personnelList.length === 0) {
        progressCallback("Skipping payroll data: No personnel available.");
        return [];
    }
    progressCallback(`Starting to seed ${count} payroll records...`);
    const payrollDataList = [];
    for (let i = 0; i < count; i++) {
        const employee = faker.helpers.arrayElement(personnelList);
        const payPeriodEnd = faker.date.recent({ days: 180 });
        const payPeriodStart = new Date(payPeriodEnd);
        payPeriodStart.setDate(payPeriodEnd.getDate() - faker.helpers.arrayElement([13, 29])); // Bi-weekly or monthly

        const grossPay = faker.finance.amount({ min: 2000, max: 10000, dec: 2 });
        const taxDeduction = parseFloat(grossPay) * faker.finance.amount({ min: 0.15, max: 0.30, dec: 2 });
        const insuranceDeduction = faker.finance.amount({ min: 50, max: 300, dec: 2 });
        const netPay = parseFloat(grossPay) - taxDeduction - parseFloat(insuranceDeduction);

        payrollDataList.push({
            employee_id: employee.personnel_uuid,
            pay_period_start: payPeriodStart.toISOString().split('T')[0],
            pay_period_end: payPeriodEnd.toISOString().split('T')[0],
            gross_pay: grossPay,
            deductions: JSON.stringify({ tax: taxDeduction.toFixed(2), insurance: insuranceDeduction }),
            net_pay: netPay.toFixed(2),
            pay_date: faker.date.future({ days: 5, refDate: payPeriodEnd }).toISOString().split('T')[0],
            payment_method: faker.helpers.arrayElement(['Direct Deposit', 'Check']),
            status: faker.helpers.arrayElement(PAYROLL_STATUSES),
            notes: faker.datatype.boolean(0.2) ? faker.lorem.sentence() : null,
        });
    }
    await batchInsert('payroll_data', payrollDataList, progressCallback);
    progressCallback('Payroll data seeding complete.');
    return payrollDataList;
}

export async function seedBenefits(count = 10, progressCallback = () => {}) {
    progressCallback(`Starting to seed ${count} benefits...`);
    const benefitsData = [];
    for (let i = 0; i < count; i++) {
        benefitsData.push({
            name: `${faker.helpers.arrayElement(BENEFIT_TYPES)} Plan ${faker.lorem.word().toUpperCase()}`,
            description: faker.lorem.sentence(),
            type: faker.helpers.arrayElement(BENEFIT_TYPES),
            provider: faker.company.name(),
            cost_to_employee: faker.finance.amount({ min: 20, max: 200, dec: 2 }),
            cost_to_company: faker.finance.amount({ min: 100, max: 500, dec: 2 }),
            eligibility_criteria: `Full-time employees after ${faker.number.int({min: 30, max: 90})} days.`,
            is_active: faker.datatype.boolean(0.9),
        });
    }
    await batchInsert('benefits', benefitsData, progressCallback);
    progressCallback('Benefits seeding complete.');
    return benefitsData;
}

export async function seedEmployeeBenefits(count = 50, personnelList, benefitsList, progressCallback = () => {}) {
    if (!personnelList || personnelList.length === 0 || !benefitsList || benefitsList.length === 0) {
        progressCallback("Skipping employee benefits: No personnel or benefits available.");
        return [];
    }
    progressCallback(`Starting to seed ${count} employee benefit enrollments...`);
    const employeeBenefitsData = [];
    const uniqueEnrollments = new Set();

    for (let i = 0; i < count; i++) {
        const employee = faker.helpers.arrayElement(personnelList);
        const benefit = faker.helpers.arrayElement(benefitsList);
        const enrollmentKey = `${employee.personnel_uuid}-${benefit.benefit_id}`;

        if (uniqueEnrollments.has(enrollmentKey)) {
            continue; 
        }
        uniqueEnrollments.add(enrollmentKey);
        
        let employeeJoinDate = new Date(); // Default to now if datejoined is not available/valid
        if (employee.datejoined) {
            const parsedJoinDate = new Date(employee.datejoined);
            if (!isNaN(parsedJoinDate)) { // Check if datejoined is a valid date string
                employeeJoinDate = parsedJoinDate;
            }
        }

        const enrollmentDate = faker.date.between({ from: employeeJoinDate, to: new Date() });

        employeeBenefitsData.push({
            employee_id: employee.personnel_uuid,
            benefit_id: benefit.benefit_id,
            enrollment_date: enrollmentDate.toISOString().split('T')[0],
            coverage_start_date: faker.date.future({ days: 30, refDate: enrollmentDate }).toISOString().split('T')[0],
            status: faker.helpers.arrayElement(['Active', 'Waived', 'Terminated']),
            notes: faker.datatype.boolean(0.1) ? faker.lorem.sentence() : null,
        });
    }
    await batchInsert('employee_benefits', employeeBenefitsData, progressCallback);
    progressCallback('Employee benefits seeding complete.');
    return employeeBenefitsData;
}

export async function seedPerformanceReviews(count = 30, personnelList, progressCallback = () => {}) {
    if (!personnelList || personnelList.length === 0) {
        progressCallback("Skipping performance reviews: No personnel available.");
        return [];
    }
    progressCallback(`Starting to seed ${count} performance reviews...`);
    const reviewsData = [];
    for (let i = 0; i < count; i++) {
        const employee = faker.helpers.arrayElement(personnelList);
        const reviewer = faker.helpers.arrayElement(personnelList.filter(p => p.personnel_uuid !== employee.personnel_uuid));
        reviewsData.push({
            // review_id will be auto-generated by DB
            employee_id: employee.personnel_uuid,
            reviewer_id: reviewer ? reviewer.personnel_uuid : null,
            review_date: faker.date.past({ years: 1 }).toISOString().split('T')[0],
            overall_rating: faker.number.int({ min: 1, max: 5 }),
            comments: faker.lorem.paragraphs(2),
            goals_for_next_period: faker.lorem.sentence(),
        });
    }
    await batchInsert('performance_reviews', reviewsData, progressCallback);
    progressCallback('Performance reviews seeding complete.');
    return reviewsData;
}

export async function seedHrDocuments(count = 20, personnelList, progressCallback = () => {}) {
     if (!personnelList || personnelList.length === 0) {
        progressCallback("Skipping HR documents: No personnel available for linking.");
        // Still seed some generic documents if no personnel
    }
    progressCallback(`Starting to seed ${count} HR documents...`);
    const documentsData = [];
    for (let i = 0; i < count; i++) {
        const employee = faker.datatype.boolean(0.7) && personnelList.length > 0 ? faker.helpers.arrayElement(personnelList) : null;
        documentsData.push({
            // document_id will be auto-generated by DB
            employee_id: employee ? employee.personnel_uuid : null,
            document_name: `${faker.lorem.words(3).replace(/ /g, '_')}_${faker.system.commonFileExt()}`,
            document_type: faker.helpers.arrayElement(DOCUMENT_TYPES),
            storage_path: `hr_documents/${faker.string.uuid()}/${faker.system.fileName()}`, // Placeholder path
            file_size: faker.number.int({ min: 10000, max: 5000000 }),
            mime_type: faker.system.mimeType(),
            description: faker.lorem.sentence(),
            uploaded_by: personnelList.length > 0 ? faker.helpers.arrayElement(personnelList).personnel_uuid : null, 
            upload_date: faker.date.past({ years: 2 }).toISOString(),
            expiry_date: faker.datatype.boolean(0.3) ? faker.date.future({ years: 3 }).toISOString().split('T')[0] : null,
            tags: faker.helpers.arrayElements([faker.lorem.word(), faker.lorem.word(), 'hr'], faker.number.int({min:1, max:3})),
            is_confidential: faker.datatype.boolean(0.2),
        });
    }
    await batchInsert('hr_documents', documentsData, progressCallback);
    progressCallback('HR documents seeding complete.');
    return documentsData;
}


export async function seedHrSuiteData(progressCallback = () => {}) {
    progressCallback("--- Starting HR Suite Data Seeding ---");
    try {
        const personnelList = await fetchPersonnelUUIDs(100, progressCallback); 

        if (personnelList.length === 0) {
            progressCallback("HR Suite seeding cannot proceed without personnel data. Ensure personnel are seeded first.");
            return "HR Suite seeding failed: No personnel data.";
        }
        
        await seedLeaveRequests(50, personnelList, progressCallback);
        await seedPayrollData(50, personnelList, progressCallback);
        
        const seededBenefits = await seedBenefits(10, progressCallback);
        if (seededBenefits.length > 0) {
            await seedEmployeeBenefits(personnelList.length * 2, personnelList, seededBenefits, progressCallback); 
        }
        
        await seedPerformanceReviews(personnelList.length, personnelList, progressCallback); 
        await seedHrDocuments(30, personnelList, progressCallback);

        progressCallback("--- HR Suite Data Seeding Complete ---");
        return "HR Suite data seeding process finished.";
    } catch (error) {
        console.error("HR Suite data seeding failed:", error);
        progressCallback(`HR Suite data seeding failed: ${error.message}`);
        throw error;
    }
}