import express, { Request, Response } from "express";
import cors from "cors";
import db, { initDatabase } from "./database";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type"],
	}),
);

// Инициализируем базу данных
initDatabase();

// 1. Проверочный роут
app.get("/", (req: Request, res: Response) => {
	res.json({
		status: "работает",
		message: "API готово к работе с фронтендом!",
	});
});

// 2. Получить список всех кабинетов (с названиями их площадок)
app.get("/api/rooms", (req: Request, res: Response) => {
	const query = `
        SELECT rooms.id, rooms.name as room_name, sites.name as site_name 
        FROM rooms 
        JOIN sites ON rooms.site_id = sites.id
    `;

	db.all(query, [], (err, rows) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		res.json(rows);
	});
});

// 3. Получить список всех разовых бронирований
app.get("/api/bookings", (req: Request, res: Response) => {
	const query = `
        SELECT bookings.id, rooms.name as room_name, managers.full_name as manager_name, 
               bookings.date, bookings.start_time, bookings.end_time, bookings.purpose
        FROM bookings
        JOIN rooms ON bookings.room_id = rooms.id
        JOIN managers ON bookings.manager_id = managers.id
    `;

	db.all(query, [], (err, rows) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		res.json(rows);
	});
});

// 4. Создать новое бронирование (POST запрос от фронтенда)
app.post("/api/bookings", (req: Request, res: Response) => {
	const { room_id, manager_id, date, start_time, end_time, purpose } = req.body;

	// Простая проверка: все ли поля прислал фронтенд
	if (
		!room_id ||
		!manager_id ||
		!date ||
		!start_time ||
		!end_time ||
		!purpose
	) {
		return res
			.status(400)
			.json({ error: "Пожалуйста, заполните все поля бронирования" });
	}

	const query = `
        INSERT INTO bookings (room_id, manager_id, date, start_time, end_time, purpose)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

	db.run(
		query,
		[room_id, manager_id, date, start_time, end_time, purpose],
		function (err) {
			if (err) {
				return res.status(500).json({ error: err.message });
			}
			// Возвращаем успешный ответ и ID новой созданной брони
			res.status(201).json({
				message: "Кабинет успешно забронирован!",
				bookingId: this.lastID,
			});
		},
	);
});

app.listen(PORT, () => {
	console.log(`[server]: Сервер запущен на http://localhost:${PORT}`);
});
