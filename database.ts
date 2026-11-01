import sqlite3 from "sqlite3";

// Открываем или создаем файл базы данных в корне проекта
const db = new sqlite3.Database("./database.db", err => {
	if (err) {
		console.error("Ошибка при открытии базы данных:", err.message);
	} else {
		console.log("[db]: Успешно подключено к SQLite (database.db)");
	}
});

// Функция для создания всех таблиц по схеме
export const initDatabase = () => {
	db.serialize(() => {
		// 1. Таблица площадок (sites)
		db.run(`CREATE TABLE IF NOT EXISTS sites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )`);

		// 2. Таблица кабинетов (rooms)
		db.run(`CREATE TABLE IF NOT EXISTS rooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            site_id INTEGER,
            name TEXT NOT NULL,
            FOREIGN KEY (site_id) REFERENCES sites(id)
        )`);

		// 3. Таблица преподавателей (teachers)
		db.run(`CREATE TABLE IF NOT EXISTS teachers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL
        )`);

		// 4. Таблица менеджеров (managers)
		db.run(`CREATE TABLE IF NOT EXISTS managers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL
        )`);

		// 5. Таблица недельного расписания (schedule_slots)
		db.run(`CREATE TABLE IF NOT EXISTS schedule_slots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER,
            teacher_id INTEGER,
            weekday INTEGER NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            title TEXT NOT NULL,
            FOREIGN KEY (room_id) REFERENCES rooms(id),
            FOREIGN KEY (teacher_id) REFERENCES teachers(id)
        )`);

		// 6. Таблица разовых броней (bookings)
		db.run(`CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER,
            manager_id INTEGER,
            date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            purpose TEXT NOT NULL,
            FOREIGN KEY (room_id) REFERENCES rooms(id),
            FOREIGN KEY (manager_id) REFERENCES managers(id)
        )`);

		console.log("[db]: Все таблицы базы данных проверены/созданы.");

		// Наполним базу тестовыми данными, если она пустая
		seedData();
	});
};

// Функция для заполнения базы начальными тестовыми данными (чтобы подруге было что отображать)
function seedData() {
	db.get("SELECT COUNT(*) as count FROM sites", (err, row: any) => {
		if (row && row.count === 0) {
			console.log("[db]: База пуста. Добавляем тестовые данные...");

			// Добавляем площадку и кабинет
			db.run("INSERT INTO sites (name) VALUES ('Главный корпус')");
			db.run("INSERT INTO rooms (site_id, name) VALUES (1, 'Кабинет 101')");
			db.run("INSERT INTO rooms (site_id, name) VALUES (1, 'Кабинет 105')");

			// Добавляем преподавателя и менеджера
			db.run(
				"INSERT INTO teachers (full_name) VALUES ('Иванов Иван Иванович')",
			);
			db.run(
				"INSERT INTO managers (full_name) VALUES ('Алексеева Анна Сергеевна')",
			);

			// Добавляем одно регулярное расписание (понедельник, weekday=1)
			db.run(
				"INSERT INTO schedule_slots (room_id, teacher_id, weekday, start_time, end_time, title) VALUES (1, 1, 1, '09:00', '10:30', 'Лекция по Веб-разработке')",
			);

			console.log("[db]: Тестовые данные успешно загружены.");
		}
	});
}

export default db;
