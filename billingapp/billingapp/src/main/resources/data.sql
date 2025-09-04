-- Clear any existing data first
DELETE FROM user_roles WHERE 1=1;
DELETE FROM users WHERE 1=1;
DELETE FROM roles WHERE 1=1;

-- Insert default roles
INSERT INTO roles (id, name) VALUES (1, 'USER');
INSERT INTO roles (id, name) VALUES (2, 'ADMIN');

-- Insert default admin user
INSERT INTO users (id, username, password, full_name, email, phone) 
VALUES (1, 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'System Administrator', 'admin@pahanaedu.com', '0000000000');

-- Assign ADMIN role to admin user
INSERT INTO user_roles (user_id, role_id) VALUES (1, 2);
