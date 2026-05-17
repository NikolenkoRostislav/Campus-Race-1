USE card_game;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(50) NOT NULL UNIQUE,
    pfp_url TEXT,
    password_hash VARCHAR(255) NOT NULL
);