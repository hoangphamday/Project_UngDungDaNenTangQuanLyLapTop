-- Chạy file này khi cần nâng cấp database hiện có mà không xóa dữ liệu.
-- Hãy sao lưu database trước khi chạy vì MySQL tự COMMIT các lệnh DDL.
USE laptop_store;

DELIMITER $$
CREATE PROCEDURE kiem_tra_du_lieu_vai_tro()
BEGIN
    DECLARE so_dong_khong_hop_le INT DEFAULT 0;

    SELECT COUNT(*) INTO so_dong_khong_hop_le
      FROM tai_khoan tk
      LEFT JOIN vai_tro vt ON vt.id = tk.vai_tro_id
     WHERE vt.id IS NULL
        OR vt.ten_vai_tro NOT IN ('ADMIN', 'STAFF', 'CUSTOMER');

    IF so_dong_khong_hop_le > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Co tai khoan mang vai tro khong hop le; migration da dung';
    END IF;
END$$
DELIMITER ;

CALL kiem_tra_du_lieu_vai_tro();
DROP PROCEDURE kiem_tra_du_lieu_vai_tro;

ALTER TABLE tai_khoan
    ADD COLUMN vai_tro_moi ENUM('ADMIN','STAFF','CUSTOMER') NULL AFTER id;

UPDATE tai_khoan tk
JOIN vai_tro vt ON vt.id = tk.vai_tro_id
   SET tk.vai_tro_moi = vt.ten_vai_tro;

ALTER TABLE tai_khoan
    MODIFY COLUMN vai_tro_moi ENUM('ADMIN','STAFF','CUSTOMER') NOT NULL DEFAULT 'CUSTOMER';

ALTER TABLE tai_khoan
    DROP FOREIGN KEY fk_taikhoan_vaitro,
    DROP COLUMN vai_tro_id,
    CHANGE COLUMN vai_tro_moi vai_tro ENUM('ADMIN','STAFF','CUSTOMER') NOT NULL DEFAULT 'CUSTOMER';

DROP TABLE vai_tro;
