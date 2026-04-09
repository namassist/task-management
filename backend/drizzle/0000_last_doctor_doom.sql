CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`due_date` date NOT NULL,
	`status` enum('Pending','Completed') NOT NULL DEFAULT 'Pending',
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
