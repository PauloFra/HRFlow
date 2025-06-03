"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const client_1 = require("@prisma/client");
const bcryptjs_1 = tslib_1.__importDefault(require("bcryptjs"));
const faker_1 = require("@faker-js/faker");
const prisma = new client_1.PrismaClient();
// Configurar faker para português brasileiro
faker_1.faker.setLocale('pt_BR');
async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');
    try {
        // Limpar dados existentes (cuidado em produção!)
        if (process.env.NODE_ENV !== 'production') {
            await prisma.auditLog.deleteMany();
            await prisma.notification.deleteMany();
            await prisma.eventAttendee.deleteMany();
            await prisma.event.deleteMany();
            await prisma.reaction.deleteMany();
            await prisma.comment.deleteMany();
            await prisma.newsArticle.deleteMany();
            await prisma.leaveRequest.deleteMany();
            await prisma.leaveBalance.deleteMany();
            await prisma.workSession.deleteMany();
            await prisma.timeEntry.deleteMany();
            await prisma.employee.deleteMany();
            await prisma.refreshToken.deleteMany();
            await prisma.user.deleteMany();
            await prisma.location.deleteMany();
            await prisma.department.deleteMany();
            await prisma.position.deleteMany();
            await prisma.company.deleteMany();
            await prisma.systemSetting.deleteMany();
            console.log('🗑️  Dados existentes removidos');
        }
        // 1. Criar Configurações do Sistema
        console.log('⚙️  Criando configurações do sistema...');
        await createSystemSettings();
        // 2. Criar Empresa
        console.log('🏢 Criando empresa...');
        const company = await createCompany();
        // 3. Criar Cargos
        console.log('💼 Criando cargos...');
        const positions = await createPositions();
        // 4. Criar Departamentos
        console.log('🏛️  Criando departamentos...');
        const departments = await createDepartments(company.id);
        // 5. Criar Localizações
        console.log('📍 Criando localizações...');
        const locations = await createLocations(company.id);
        // 6. Criar Usuários e Funcionários
        console.log('👥 Criando usuários e funcionários...');
        const { adminUser, employees } = await createUsersAndEmployees(company.id, departments, positions);
        // 7. Atualizar gerentes dos departamentos
        console.log('👔 Configurando gerentes dos departamentos...');
        await updateDepartmentManagers(departments, employees);
        // 8. Criar Saldos de Férias
        console.log('🏖️  Criando saldos de férias...');
        await createLeaveBalances(employees);
        // 9. Criar alguns registros de ponto
        console.log('⏰ Criando registros de ponto...');
        await createTimeEntries(employees, locations);
        // 10. Criar artigos de notícias
        console.log('📰 Criando artigos de notícias...');
        await createNewsArticles(employees);
        // 11. Criar eventos
        console.log('📅 Criando eventos...');
        await createEvents(employees);
        console.log('✅ Seed concluído com sucesso!');
        console.log('\n📋 Dados criados:');
        console.log(`   • 1 empresa: ${company.name}`);
        console.log(`   • ${departments.length} departamentos`);
        console.log(`   • ${positions.length} cargos`);
        console.log(`   • ${locations.length} localizações`);
        console.log(`   • ${employees.length + 1} usuários (incluindo admin)`);
        console.log('\n🔑 Credenciais do administrador:');
        console.log(`   • Email: admin@hrflow.com`);
        console.log(`   • Senha: admin123`);
        console.log(`   • Role: ADMIN`);
    }
    catch (error) {
        console.error('❌ Erro durante o seed:', error);
        throw error;
    }
}
async function createSystemSettings() {
    const settings = [
        {
            key: 'company.working_hours',
            value: {
                monday: { start: '08:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00' },
                tuesday: { start: '08:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00' },
                wednesday: { start: '08:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00' },
                thursday: { start: '08:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00' },
                friday: { start: '08:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00' },
                saturday: null,
                sunday: null
            },
            description: 'Horários padrão de trabalho da empresa',
            isPublic: true
        },
        {
            key: 'leave.vacation_days_per_year',
            value: 30,
            description: 'Quantidade de dias de férias por ano',
            isPublic: true
        },
        {
            key: 'notifications.email_enabled',
            value: true,
            description: 'Habilitar notificações por email',
            isPublic: false
        },
        {
            key: 'time_tracking.geolocation_required',
            value: true,
            description: 'Exigir geolocalização para registro de ponto',
            isPublic: true
        }
    ];
    for (const setting of settings) {
        await prisma.systemSetting.create({
            data: setting
        });
    }
}
async function createCompany() {
    return await prisma.company.create({
        data: {
            name: 'HRFlow Tecnologia Ltda',
            cnpj: '12.345.678/0001-90',
            email: 'contato@hrflow.com.br',
            phone: '(11) 3000-4000',
            website: 'https://hrflow.com.br',
            address: 'Av. Paulista, 1000 - Conjunto 101',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01310-100',
            country: 'Brasil',
            workingHours: {
                start: '08:00',
                end: '18:00',
                lunchStart: '12:00',
                lunchEnd: '13:00'
            },
            timezone: 'America/Sao_Paulo'
        }
    });
}
async function createPositions() {
    const positionsData = [
        { title: 'CEO', description: 'Chief Executive Officer', level: 'Executive' },
        { title: 'CTO', description: 'Chief Technology Officer', level: 'Executive' },
        { title: 'Gerente de RH', description: 'Gerente de Recursos Humanos', level: 'Gerencial' },
        { title: 'Gerente de TI', description: 'Gerente de Tecnologia da Informação', level: 'Gerencial' },
        { title: 'Desenvolvedor Sênior', description: 'Desenvolvedor de Software Sênior', level: 'Sênior' },
        { title: 'Desenvolvedor Pleno', description: 'Desenvolvedor de Software Pleno', level: 'Pleno' },
        { title: 'Desenvolvedor Júnior', description: 'Desenvolvedor de Software Júnior', level: 'Júnior' },
        { title: 'Analista de RH', description: 'Analista de Recursos Humanos', level: 'Pleno' },
        { title: 'Assistente Administrativo', description: 'Assistente Administrativo', level: 'Júnior' },
        { title: 'Designer UX/UI', description: 'Designer de Experiência do Usuário', level: 'Pleno' }
    ];
    const positions = [];
    for (const positionData of positionsData) {
        const position = await prisma.position.create({
            data: {
                ...positionData,
                salaryRange: {
                    min: faker_1.faker.datatype.number({ min: 3000, max: 8000 }),
                    max: faker_1.faker.datatype.number({ min: 8000, max: 20000 }),
                    currency: 'BRL'
                }
            }
        });
        positions.push(position);
    }
    return positions;
}
async function createDepartments(companyId) {
    const departmentsData = [
        { name: 'Tecnologia da Informação', description: 'Departamento de TI e Desenvolvimento', code: 'TI' },
        { name: 'Recursos Humanos', description: 'Departamento de Gestão de Pessoas', code: 'RH' },
        { name: 'Financeiro', description: 'Departamento Financeiro e Contábil', code: 'FIN' },
        { name: 'Comercial', description: 'Departamento de Vendas e Marketing', code: 'COM' },
        { name: 'Operações', description: 'Departamento de Operações', code: 'OPS' }
    ];
    const departments = [];
    for (const deptData of departmentsData) {
        const department = await prisma.department.create({
            data: {
                ...deptData,
                companyId
            }
        });
        departments.push(department);
    }
    return departments;
}
async function createLocations(companyId) {
    const locationsData = [
        {
            name: 'Sede - Paulista',
            address: 'Av. Paulista, 1000 - Bela Vista',
            latitude: -23.5613,
            longitude: -46.6562,
            radius: 100
        },
        {
            name: 'Filial - Vila Olimpia',
            address: 'Rua Funchal, 500 - Vila Olímpia',
            latitude: -23.5955,
            longitude: -46.6866,
            radius: 150
        }
    ];
    const locations = [];
    for (const locationData of locationsData) {
        const location = await prisma.location.create({
            data: {
                ...locationData,
                companyId
            }
        });
        locations.push(location);
    }
    return locations;
}
async function createUsersAndEmployees(companyId, departments, positions) {
    // Criar usuário administrador
    const adminPassword = await bcryptjs_1.default.hash('admin123', 12);
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@hrflow.com',
            username: 'admin',
            passwordHash: adminPassword,
            role: client_1.UserRole.ADMIN,
            status: 'ACTIVE',
            emailVerifiedAt: new Date()
        }
    });
    // Criar funcionário administrador
    await prisma.employee.create({
        data: {
            employeeNumber: 'EMP001',
            userId: adminUser.id,
            companyId,
            departmentId: departments.find(d => d.code === 'TI')?.id,
            positionId: positions.find(p => p.title === 'CTO')?.id,
            firstName: 'Administrador',
            lastName: 'Sistema',
            fullName: 'Administrador Sistema',
            cpf: '000.000.000-00',
            hireDate: new Date('2024-01-01'),
            status: client_1.EmployeeStatus.ACTIVE
        }
    });
    // Criar funcionários de exemplo
    const employees = [];
    const employeeData = [
        {
            firstName: 'Maria',
            lastName: 'Silva',
            email: 'maria.silva@hrflow.com',
            role: client_1.UserRole.HR,
            department: 'RH',
            position: 'Gerente de RH',
            cpf: '111.111.111-11'
        },
        {
            firstName: 'João',
            lastName: 'Santos',
            email: 'joao.santos@hrflow.com',
            role: client_1.UserRole.MANAGER,
            department: 'TI',
            position: 'Gerente de TI',
            cpf: '222.222.222-22'
        },
        {
            firstName: 'Ana',
            lastName: 'Costa',
            email: 'ana.costa@hrflow.com',
            role: client_1.UserRole.EMPLOYEE,
            department: 'TI',
            position: 'Desenvolvedor Sênior',
            cpf: '333.333.333-33'
        },
        {
            firstName: 'Carlos',
            lastName: 'Oliveira',
            email: 'carlos.oliveira@hrflow.com',
            role: client_1.UserRole.EMPLOYEE,
            department: 'TI',
            position: 'Desenvolvedor Pleno',
            cpf: '444.444.444-44'
        },
        {
            firstName: 'Lucia',
            lastName: 'Ferreira',
            email: 'lucia.ferreira@hrflow.com',
            role: client_1.UserRole.EMPLOYEE,
            department: 'RH',
            position: 'Analista de RH',
            cpf: '555.555.555-55'
        }
    ];
    for (let i = 0; i < employeeData.length; i++) {
        const empData = employeeData[i];
        const password = await bcryptjs_1.default.hash('123456', 12);
        const user = await prisma.user.create({
            data: {
                email: empData.email,
                username: empData.email.split('@')[0],
                passwordHash: password,
                role: empData.role,
                status: 'ACTIVE',
                emailVerifiedAt: new Date()
            }
        });
        const employee = await prisma.employee.create({
            data: {
                employeeNumber: `EMP${(i + 2).toString().padStart(3, '0')}`,
                userId: user.id,
                companyId,
                departmentId: departments.find(d => d.code === empData.department)?.id,
                positionId: positions.find(p => p.title === empData.position)?.id,
                firstName: empData.firstName,
                lastName: empData.lastName,
                fullName: `${empData.firstName} ${empData.lastName}`,
                cpf: empData.cpf,
                birthDate: faker_1.faker.date.birthdate({ min: 25, max: 55, mode: 'age' }),
                gender: faker_1.faker.helpers.arrayElement([client_1.Gender.MALE, client_1.Gender.FEMALE]),
                personalEmail: faker_1.faker.internet.email(),
                phone: faker_1.faker.phone.number('(##) ####-####'),
                cellPhone: faker_1.faker.phone.number('(##) #####-####'),
                address: faker_1.faker.address.streetAddress(),
                city: 'São Paulo',
                state: 'SP',
                zipCode: faker_1.faker.address.zipCode('#####-###'),
                hireDate: faker_1.faker.date.between('2020-01-01', '2024-01-01'),
                salary: faker_1.faker.datatype.number({ min: 5000, max: 15000 }),
                salaryType: 'MONTHLY',
                status: client_1.EmployeeStatus.ACTIVE
            }
        });
        employees.push(employee);
    }
    return { adminUser, employees };
}
async function updateDepartmentManagers(departments, employees) {
    // Atualizar gerente do RH
    const rhManager = employees.find(e => e.fullName === 'Maria Silva');
    if (rhManager) {
        await prisma.department.update({
            where: { id: departments.find(d => d.code === 'RH')?.id },
            data: { managerId: rhManager.id }
        });
    }
    // Atualizar gerente do TI
    const tiManager = employees.find(e => e.fullName === 'João Santos');
    if (tiManager) {
        await prisma.department.update({
            where: { id: departments.find(d => d.code === 'TI')?.id },
            data: { managerId: tiManager.id }
        });
    }
}
async function createLeaveBalances(employees) {
    const currentYear = new Date().getFullYear();
    for (const employee of employees) {
        await prisma.leaveBalance.create({
            data: {
                employeeId: employee.id,
                year: currentYear,
                leaveType: 'VACATION',
                totalDays: 30,
                usedDays: faker_1.faker.datatype.number({ min: 0, max: 10 }),
                remainingDays: faker_1.faker.datatype.number({ min: 20, max: 30 }),
                pendingDays: 0
            }
        });
    }
}
async function createTimeEntries(employees, locations) {
    const today = new Date();
    const daysBack = 7;
    for (const employee of employees) {
        for (let i = 0; i < daysBack; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            // Pular fins de semana
            if (date.getDay() === 0 || date.getDay() === 6)
                continue;
            const clockIn = new Date(date);
            clockIn.setHours(8, faker_1.faker.datatype.number({ min: 0, max: 30 }), 0, 0);
            const clockOut = new Date(date);
            clockOut.setHours(18, faker_1.faker.datatype.number({ min: 0, max: 60 }), 0, 0);
            await prisma.timeEntry.create({
                data: {
                    employeeId: employee.id,
                    locationId: faker_1.faker.helpers.arrayElement(locations).id,
                    type: 'CLOCK_IN',
                    timestamp: clockIn,
                    latitude: -23.5613 + (Math.random() - 0.5) * 0.01,
                    longitude: -46.6562 + (Math.random() - 0.5) * 0.01,
                    accuracy: faker_1.faker.datatype.number({ min: 5, max: 20 }),
                    status: 'APPROVED'
                }
            });
            await prisma.timeEntry.create({
                data: {
                    employeeId: employee.id,
                    locationId: faker_1.faker.helpers.arrayElement(locations).id,
                    type: 'CLOCK_OUT',
                    timestamp: clockOut,
                    latitude: -23.5613 + (Math.random() - 0.5) * 0.01,
                    longitude: -46.6562 + (Math.random() - 0.5) * 0.01,
                    accuracy: faker_1.faker.datatype.number({ min: 5, max: 20 }),
                    status: 'APPROVED'
                }
            });
        }
    }
}
async function createNewsArticles(employees) {
    const articles = [
        {
            title: 'Bem-vindos ao HRFlow!',
            content: 'Estamos felizes em apresentar nosso novo sistema de gestão de RH. Este sistema foi desenvolvido para facilitar o dia a dia de todos os funcionários.',
            category: 'ANNOUNCEMENT',
            authorId: employees[0]?.id
        },
        {
            title: 'Nova Política de Home Office',
            content: 'A partir do próximo mês, todos os funcionários poderão trabalhar em regime de home office até 2 dias por semana.',
            category: 'POLICY',
            authorId: employees[0]?.id
        },
        {
            title: 'Treinamento de Segurança da Informação',
            content: 'Será realizado na próxima semana um treinamento obrigatório sobre segurança da informação para todos os funcionários.',
            category: 'TRAINING',
            authorId: employees[1]?.id
        }
    ];
    for (const articleData of articles) {
        if (articleData.authorId) {
            await prisma.newsArticle.create({
                data: {
                    ...articleData,
                    excerpt: articleData.content.substring(0, 150) + '...',
                    status: 'PUBLISHED',
                    publishedAt: new Date(),
                    targetRoles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']
                }
            });
        }
    }
}
async function createEvents(employees) {
    const events = [
        {
            title: 'Reunião Semanal de Equipe',
            description: 'Reunião semanal para alinhamento das atividades da equipe',
            type: 'MEETING',
            startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // amanhã
            endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1h depois
            organizerId: employees[1]?.id
        },
        {
            title: 'Confraternização da Empresa',
            description: 'Evento de confraternização de fim de ano',
            type: 'COMPANY_EVENT',
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // próxima semana
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4h depois
            organizerId: employees[0]?.id
        }
    ];
    for (const eventData of events) {
        if (eventData.organizerId) {
            await prisma.event.create({
                data: eventData
            });
        }
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map