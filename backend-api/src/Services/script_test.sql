/*
powered by  : (c) 2025, Ramadan Ismael - All rights reserved!!
to          : TEKA AWAY
*/

SELECT 1;



-- DROP TABLES
DROP TABLE tbUsers;                 -- tbRefreshToken, tbCashRegister
DROP TABLE tbRefreshToken;
DROP TABLE tbIngredients;           -- tbIngredientsProducts
DROP TABLE tbProducts;              -- tbIngredientsProducts, tbOrders
DROP TABLE tbIngredientsProducts;
DROP TABLE tbCashRegister;          -- tbCashRegisterDetails
DROP TABLE tbCashRegisterDetails;
DROP TABLE tbSales;                 -- tbCustomers, tbOrder, tbPaymentSales
DROP TABLE tbCustomers;
DROP TABLE tbOrders;
DROP TABLE tbPaymentSales;
-- DROP TABLES

delete from tbrefreshtoken
delete from tbPaymentSales
delete from tbOrders
delete from tbCustomers
delete from tbSales
delete from tbCashRegisterDetails
delete from tbCashRegister


-- SELECT TABLES
SELECT * FROM tbUsers;
SELECT * FROM tbRefreshToken;
SELECT * FROM tbIngredients;
SELECT * FROM tbProducts;
SELECT * FROM tbIngredientsProducts;
SELECT * FROM tbCashRegister;
SELECT * FROM tbCashRegisterDetails;
SELECT * FROM tbSales;
SELECT * FROM tbCustomers;
SELECT * FROM tbOrders;
SELECT * FROM tbPaymentOrders;

-- SELECT TABLES



-- USERS
DROP TABLE tbUsers;

SELECT * FROM tbUsers;
SELECT id, username, phone_number, roles, images, is_active, created_at, updated_at FROM tbUsers;
SELECT username FROM tbUsers WHERE username = 'ramadan';
SELECT images FROM tbUsers WHERE id = '3d789b04-b0fa-4a4c-8b07-9a4e3d1cc0c4';
SELECT username FROM tbUsers WHERE id = 'f7dda3c8-e1fc-4f0a-89de-e5443f1a8d74';
SELECT username FROM tbUsers WHERE id = (SELECT user_id FROM tbRefreshToken WHERE id = 'f7dda3c8-e1fc-4f0a-89de-e5443f1a8d74' LIMIT 1);
SELECT TO_CHAR(created_at, 'DD-MM-YYYY') AS created_date FROM tbusers;

INSERT INTO tbUsers(id, username, password_hash) VALUES('333d55e0-cadc-4412-9da2-4045aa0c1510', '_ramadan', '$2a$10$BlY1qAmZZ7x4jEUUfzHb6eQbNaeZBdMHu2zfckU.0av1MhyFMrmrW');

UPDATE tbUsers SET username = 'friend', phone_number = '12345678', updated_at = NOW() WHERE id = '914e70ca-49f9-4d87-9802-58f027d6c708';

DELETE FROM tbusers WHERE id = '80407cfc-99a5-48b5-ac33-4975900f5415';
DELETE FROM tbUsers WHERE username = 'yes yes yes';
-- USERS



-- REFRESH TOKEN
DROP TABLE tbrefreshtoken;

SELECT * FROM tbRefreshToken;

DELETE FROM tbRefreshToken WHERE id = 'c41f251c-1492-4d32-a6be-edd6d3d0bc5d';
DELETE FROM tbRefreshToken;
-- REFRESH TOKEN



-- INGREDIENTS
DROP TABLE tbIngredients;

SELECT * FROM tbIngredients;
SELECT
    COUNT(*) FILTER (WHERE is_active = TRUE)                                  AS activeCount,
    COUNT(*) FILTER (WHERE is_active = FALSE)                                 AS inactiveCount,
    COALESCE(SUM(quantity) FILTER (WHERE is_active = TRUE), 0)                AS totalActiveQty,
    COUNT(*) FILTER (WHERE expiration_status = 'Near Expiry' AND is_active)   AS nearExpiryCount,
    COUNT(*) FILTER (WHERE expiration_status = 'Expired' AND is_active)       AS expiredCount
FROM tbIngredients;
SELECT id, CONCAT_WS(' ', item_name, package_size, unit_of_measure) AS ItemName FROM tbIngredients ORDER BY ItemName ASC;

DELETE FROM tbIngredients WHERE id = '28b5e2d9-4611-4617-92fc-21ef7e6e9f12';
-- INGREDIENTS



-- PRODUCTS
DROP TABLE tbProducts;

SELECT * FROM tbProducts;
SELECT
    p.id,
    p.item_name,
    p.image_url,
    p.price,
    p.category,
    p.is_active,
    p.created_at,
    COALESCE((
        SELECT json_agg(
            json_build_object(
                'package_size', o.package_size,
                'unit_of_measure', o.unit_of_measure
            )
        )
        FROM tbIngredientsProducts o
        WHERE o.product_id = p.id
    ), '[]'::json) AS ingredients
FROM tbProducts p;

INSERT INTO tbProducts (item_name, image_url, price, category, is_active, created_at) 
VALUES
('Bamboo Watch',        'https://example.com/img/bamboo.jpg',     65.00, 'Accessories', TRUE,  '2025-04-01 10:00:00+00'),
('Black Watch',         'https://example.com/img/black.jpg',       72.00, 'Accessories', TRUE,  '2025-04-02 11:15:00+00'),
('Blue Fitness Band',   'https://example.com/img/blue-band.jpg',   79.00, 'Fitness',     TRUE,  '2025-04-03 09:30:00+00'),
('Yoga Mat Pro',        'https://example.com/img/yoga-mat.jpg',   119.90, 'Fitness',     TRUE,  '2025-04-04 14:20:00+00'),
('Stainless Steel Bottle','https://example.com/img/bottle.jpg',     45.00, 'Accessories', FALSE, '2025-04-05 16:45:00+00');

DELETE FROM tbProducts WHERE id = 'e2100cc8-1710-4762-aade-8a95c5d291f7';
-- PRODUCTS



-- INGREDIENTS PRODUCTS
DROP TABLE tbIngredientsProducts;

SELECT * FROM tbIngredientsProducts;
SELECT
    i.item_name AS item_name,
    ip.package_size,
    ip.unit_of_measure,
    ip.quantity
FROM tbIngredientsProducts ip
JOIN tbIngredients i ON i.id = ip.ingredient_id
WHERE ip.product_id = '798035ea-9bf0-4cee-9fcc-b6f1d42b37ab';
SELECT 1 FROM tbIngredientsProducts WHERE id = '15b23fdd-b3de-41dd-bf16-e75bc00a5b37' AND ingredient_id = '0508dc3d-f10f-4e9d-9136-c29695470d7c';
SELECT
    ip.id AS Id,
    i.item_name || ' ' || i.package_size || '' || i.unit_of_measure AS ItemName,
    ip.quantity AS Quantity
FROM tbIngredientsProducts ip
JOIN tbIngredients i ON i.id = ip.ingredient_id;

INSERT INTO tbIngredientsProducts (product_id, ingredient_id, package_size, unit_of_measure, quantity)
VALUES
('c11c9146-3f8c-4f77-8b48-1118fbf343a4', '860ea9eb-f74f-4dbb-a319-3a90889a0a7d', 1,    'un',   1),  
('798035ea-9bf0-4cee-9fcc-b6f1d42b37ab', '860ea9eb-f74f-4dbb-a319-3a90889a0a7d', 50,   'ml',   1),  
('c11c9146-3f8c-4f77-8b48-1118fbf343a4', '2e6196dd-809b-4bb2-9848-f71751e19071', 2,    'm²',   1),  
('c11c9146-3f8c-4f77-8b48-1118fbf343a4', '291f571d-b3e1-49e6-afd6-aa2233aa91a5', 500,  'g',    0.1),
('798035ea-9bf0-4cee-9fcc-b6f1d42b37ab', '0cf73ce7-794c-4830-bd2c-e407b8b5e27d', 1,    'un',   2); 
-- INGREDIENTS PRODUCTS



-- CASH REGISTER
DROP TABLE IF EXISTS tbCashRegister;
DROP TYPE cash_name_enum;
DELETE FROM tbcashregister;

SELECT * FROM tbCashRegister;

INSERT INTO tbCashRegister (is_opened, user_id) VALUES
(TRUE, '70263909-19ee-4c59-924d-13a175d286a6');
INSERT INTO tbCashRegister (is_opened, user_id) VALUES
(TRUE, '5dd17cbd-5e64-40ae-8282-656733222b04');

UPDATE tbCashRegister SET is_opened = FALSE WHERE id = 'd7abdb30-1d29-4a16-a14f-23b89a4e4ee1';

SELECT
    cr.id AS CashRegisterId,
    cr.is_opened AS Status
FROM tbCashRegister cr
INNER JOIN tbCashRegisterDetails crd ON crd.cash_register_id = cr.id
WHERE (crd.cash_name = 'opened' OR crd.cash_name = 'closed') AND cr.user_id = '333d55e0-cadc-4412-9da2-4045aa0c1510'
ORDER BY crd.created_at DESC
LIMIT 1;

SELECT DISTINCT ON (u.id)
    u.id,
    u.username
FROM tbUsers u
LEFT JOIN (
    SELECT DISTINCT ON (cr.user_id)
        cr.user_id,
        cr.is_opened
    FROM tbCashRegister cr
    JOIN tbCashRegisterDetails crd 
        ON cr.id = crd.cash_register_id
    ORDER BY cr.user_id, crd.date_time DESC
) latest 
    ON latest.user_id = u.id
WHERE 
    latest.is_opened = FALSE
    OR latest.user_id IS NULL
ORDER BY 
    u.id,
    u.username ASC;

SELECT *
FROM (
    SELECT DISTINCT ON (cr.user_id)
        cr.id AS Id,
        u.username AS Username
    FROM tbCashRegister cr
    JOIN tbUsers u ON cr.user_id = u.id
    WHERE cr.is_opened = TRUE
    ORDER BY cr.user_id DESC
) sub
ORDER BY Username ASC;


/* DETAILS */
DROP TABLE IF EXISTS tbCashRegisterDetails;
DELETE FROM tbcashregisterdetails;

SELECT * FROM tbCashRegisterDetails;

INSERT INTO tbCashRegisterDetails (cash_register_id, cash_name, amount, description, date_time) VALUES
('6c08fbe3-5669-47af-89d7-5c15176041fb', 'opened', 500, 'Opening Balance', NOW());
INSERT INTO tbCashRegisterDetails (cash_register_id, cash_name, amount, description, date_time) VALUES
('d7abdb30-1d29-4a16-a14f-23b89a4e4ee1', 'opened', 100, 'Opening Balance', NOW());

UPDATE tbCashRegisterDetails SET status = FALSE, updated_at = NOW(), date_time = NOW() WHERE id = 'd7abdb30-1d29-4a16-a14f-23b89a4e4ee1';

SELECT
    COALESCE(SUM(amount) FILTER (WHERE cash_name = 'Cash In' AND status = TRUE), 0) AS cashIn,
    COALESCE(SUM(amount) FILTER (WHERE cash_name = 'Cash Out' AND status = TRUE), 0) AS cashOut
FROM tbCashRegisterDetails;

SELECT
    u.username AS Operator,
    crd.cash_name AS CashName,
    crd.amount AS Amount,
    crd.description AS Description,
    crd.is_confirmed AS Status,
    crd.date_time AS UpdatedAt
FROM tbCashRegisterDetails crd
INNER JOIN tbCashRegister cr ON cr.id = crd.cash_register_id
INNER JOIN tbUsers u ON u.id = cr.user_id
WHERE crd.date_time::DATE = '2025-12-03'
ORDER BY crd.date_time DESC;

select * from tbsales;
select * from tbcashregisterdetails
select * from tbcashregister

SELECT
    cr.id,
    u.username AS Operator,
    cr.is_opened AS Status,
    COALESCE(MAX(crd.amount) FILTER (
        WHERE crd.cash_name = 'opened' AND crd.is_confirmed = TRUE
    ), 0.00) AS TotalOpened,
    COALESCE(MAX(crd.amount) FILTER (
        WHERE crd.cash_name = 'closed' AND crd.is_confirmed = TRUE
    ), 0.00) AS TotalClosed,
    MAX(crd.created_at) FILTER (
        WHERE crd.cash_name = 'opened' AND crd.is_confirmed = TRUE
    ) AS OpenedAt,    
    MAX(crd.created_at) FILTER (
        WHERE crd.cash_name = 'closed' AND crd.is_confirmed = TRUE
    ) AS ClosedAt
FROM tbCashRegister cr
JOIN tbUsers u ON cr.user_id = u.id
LEFT JOIN tbCashRegisterDetails crd ON cr.id = crd.cash_register_id
GROUP BY
    cr.id,
    u.username,
    cr.is_opened
ORDER BY MAX(crd.date_time) DESC NULLS LAST;

-- CARDS

SELECT
    init.InitialBalance,
    rev.TotalRevenue,
    exp.TotalExpense,
    (rev.TotalRevenue - exp.TotalExpense) AS TotalProfit
FROM
    (
        SELECT 
            COALESCE(SUM(crd.amount), 0) AS InitialBalance
        FROM tbCashRegisterDetails crd
        INNER JOIN tbCashRegister cr 
            ON cr.id = crd.cash_register_id
        WHERE crd.date_time::date = CURRENT_DATE
          AND crd.cash_name IN ('opened', 'cash in')
          AND crd.is_confirmed = TRUE
          AND cr.is_opened = TRUE
          AND cr.id = 'a8114b25-d067-4a97-b24d-be0717223293'
    ) AS init

CROSS JOIN
    (
        SELECT 
            COALESCE(SUM(o.total_to_pay), 0) AS TotalRevenue
        FROM tbOrders o
        INNER JOIN tbSales s
            ON s.id = o.sales_id
        INNER JOIN tbCashRegister cr
            ON cr.id = s.cash_register_id
        WHERE o.created_at::date = CURRENT_DATE
          AND o.status = 'paid'
          AND cr.is_opened = TRUE
          AND cr.id = 'a8114b25-d067-4a97-b24d-be0717223293'
    ) AS rev

CROSS JOIN
    (
        SELECT 
            COALESCE(SUM(amount), 0) AS TotalExpense
        FROM tbCashRegisterDetails
        INNER JOIN tbCashRegister cr
            ON cr.id = cash_register_id
        WHERE date_time::date = CURRENT_DATE
          AND cash_name = 'cash out'
          AND is_confirmed = TRUE
          AND cr.is_opened = TRUE
          AND cr.id = 'a8114b25-d067-4a97-b24d-be0717223293'
    ) AS exp;



-- CASH REGISTER



-- SALES
DROP TABLE tbSales; -- tbOrder, tbPaymentOrders

SELECT * FROM tbSales;
SELECT COUNT(*) AS Total FROM tbSales;
-- SALES



-- CUSTOMER
DROP TABLE tbCustomers;
DROP TRIGGER IF EXISTS trg_set_default_fullname ON tbCustomers;

SELECT * FROM tbCustomers;

DELETE FROM tbCustomers;
-- CUSTOMER



-- ORDERS
DROP TABLE IF EXISTS tbOrders;

DELETE FROM tbOrders;

SELECT * FROM tbOrders;
SELECT id FROM tbOrders WHERE customer_id = '4dc9af89-2e3e-4b38-854d-6c192547a34f';

SELECT order_number
FROM tbOrders
ORDER BY created_at DESC
LIMIT 1;

SELECT
    COALESCE(SUM(total_to_pay) FILTER (
        WHERE is_available = TRUE AND status = 'paid'
    ), 0.00) AS TotalEntrada
FROM tborders;
------

SELECT
    s.id AS Id,
    MAX(c.fullName) AS CustomerName,
    MAX(c.phone_number) AS CustomerPhone,

    COALESCE(produtos.descricao, 'Sem itens') AS Description,

    COALESCE(items.total_qty, 0)        AS TotalQty,
    COALESCE(items.total_to_pay, 0.00)    AS TotalPay,
    COALESCE(payments.total_paid, 0.00)   AS TotalPaid,
    GREATEST(COALESCE(payments.total_paid, 0) - COALESCE(items.total_to_pay, 0), 0) AS TotalChange,

    MAX(o.status) AS Status,
    MAX(u.username) AS Operator,
    MAX(o.created_at) AS CreatedAt

FROM tbSales s
INNER JOIN tbCashRegister cr ON cr.id = s.cash_register_id
INNER JOIN tbUsers u ON u.id = cr.user_id
INNER JOIN tbCustomers c ON c.sales_id = s.id

-- Totais dos itens (sem duplicação)
CROSS JOIN LATERAL (
    SELECT
        SUM(quantity)     AS total_qty,
        SUM(total_to_pay) AS total_to_pay
    FROM tbOrders
    WHERE sales_id = s.id AND status IN ('pending', 'paid')
) items

-- Total pago (sem duplicação)
LEFT JOIN LATERAL (
    SELECT SUM(total_paid) AS total_paid
    FROM tbPaymentSales
    WHERE sales_id = s.id AND is_paid = TRUE
) payments ON TRUE

-- Descrição bonitinha: "2 × Camiseta • 1 × Calça"
LEFT JOIN LATERAL (
    SELECT STRING_AGG(qtd_nome, ' • ' ORDER BY qtd_nome) AS descricao
    FROM (
        SELECT DISTINCT
            o.quantity || ' × ' || p.item_name AS qtd_nome
        FROM tbOrders o
        JOIN tbProducts p ON p.id = o.product_id
        WHERE o.sales_id = s.id
          AND o.status IN ('pending', 'paid')
    ) sub
) produtos ON TRUE

-- Só pra pegar status e data (usa MAX, então não incha as somas)
LEFT JOIN tbOrders o ON o.sales_id = s.id AND o.status IN ('pending', 'paid')

GROUP BY 
    s.id,
    items.total_qty,
    items.total_to_pay,
    payments.total_paid,
    produtos.descricao

ORDER BY CreatedAt DESC NULLS LAST;


-------------------------------------------
----------------------------------------

SELECT
    s.id AS Id,
    MAX(c.fullName) AS CustomerName,
    MAX(c.phone_number) AS CustomerPhone,

    COALESCE(produtos.descricao, 'Sem itens') AS Description,

    COALESCE(items.total_qty, 0)        AS TotalQty,
    COALESCE(items.total_to_pay, 0.00)    AS TotalPay,
    COALESCE(payments.total_paid, 0.00)   AS TotalPaid,
    GREATEST(COALESCE(payments.total_paid, 0) - COALESCE(items.total_to_pay, 0), 0) AS TotalChange,

    MAX(o.status) AS Status,
    MAX(u.username) AS Operator,
    MAX(o.created_at) AS CreatedAt

FROM tbSales s
INNER JOIN tbCashRegister cr ON cr.id = s.cash_register_id
INNER JOIN tbUsers u ON u.id = cr.user_id
INNER JOIN tbCustomers c ON c.sales_id = s.id

-- Totais dos itens (sem duplicação)
CROSS JOIN LATERAL (
    SELECT
        SUM(quantity)     AS total_qty,
        SUM(total_to_pay) AS total_to_pay
    FROM tbOrders
    WHERE sales_id = s.id AND status IN ('pending', 'paid')
) items

-- Total pago (sem duplicação)
LEFT JOIN LATERAL (
    SELECT SUM(total_paid) AS total_paid
    FROM tbPaymentSales
    WHERE sales_id = s.id AND is_paid = TRUE
) payments ON TRUE

-- Descrição bonitinha: "2 × Camiseta • 1 × Calça"
LEFT JOIN LATERAL (
    SELECT STRING_AGG(qtd_nome, ' • ' ORDER BY qtd_nome) AS descricao
    FROM (
        SELECT DISTINCT
            o.quantity || ' × ' || p.item_name AS qtd_nome
        FROM tbOrders o
        JOIN tbProducts p ON p.id = o.product_id
        WHERE o.sales_id = s.id
          AND o.status IN ('pending', 'paid')
    ) sub
) produtos ON TRUE

-- Só pra pegar status e data (usa MAX, então não incha as somas)
LEFT JOIN tbOrders o ON o.sales_id = s.id AND o.status IN ('pending', 'paid')

GROUP BY 
    s.id,
    items.total_qty,
    items.total_to_pay,
    payments.total_paid,
    produtos.descricao

ORDER BY CreatedAt DESC NULLS LAST;

----------------------------------------------------
----------------------------
-- search by date
SELECT
    s.id AS Id,
    MAX(u.username) AS Operator,
    MAX(c.fullName) AS CustomerName,
    MAX(c.phone_number) AS CustomerPhone,

    COALESCE(produtos.descricao, 'Sem itens') AS Description,

    COALESCE(items.total_qty, 0)           AS TotalQty,
    COALESCE(items.total_to_pay, 0.00)     AS TotalPay,
    COALESCE(payments.total_paid, 0.00)    AS TotalPaid,
    GREATEST(COALESCE(payments.total_paid, 0) - COALESCE(items.total_to_pay, 0), 0) AS TotalChange,

    MAX(o.status) AS Status,
    MAX(o.created_at) AS CreatedAt

FROM tbSales s
INNER JOIN tbCashRegister cr ON cr.id = s.cash_register_id
INNER JOIN tbCashRegisterDetails crd ON crd.cash_register_id = cr.id
INNER JOIN tbUsers u ON u.id = cr.user_id
INNER JOIN tbCustomers c ON c.sales_id = s.id

-- Totais dos itens
CROSS JOIN LATERAL (
    SELECT
        SUM(o.quantity)     AS total_qty,
        SUM(o.total_to_pay) AS total_to_pay
    FROM tbOrders o
    WHERE o.sales_id = s.id 
        AND o.status IN ('pending', 'paid')
        AND o.created_at::DATE = '2025-12-09'
) items

-- Total pago
LEFT JOIN LATERAL (
    SELECT SUM(total_paid) AS total_paid
    FROM tbPaymentSales ps
    WHERE ps.sales_id = s.id 
        AND ps.is_paid = TRUE
) payments ON TRUE

-- Descrição dos itens
LEFT JOIN LATERAL (
    SELECT STRING_AGG(qtd_nome, ' • ' ORDER BY qtd_nome) AS descricao
    FROM (
        SELECT DISTINCT
            o.quantity || ' × ' || p.item_name AS qtd_nome
        FROM tbOrders o
        JOIN tbProducts p ON p.id = o.product_id
        WHERE o.sales_id = s.id
          AND o.status IN ('pending', 'paid')
    ) sub
) produtos ON TRUE

LEFT JOIN tbOrders o 
    ON o.sales_id = s.id 
   AND o.status IN ('pending', 'paid')

WHERE cr.is_opened = TRUE
  --AND cr.id = '4546fa30-4ade-42e6-8b6f-fb68cb6d87a5'
  AND crd.date_time::DATE = '2025-12-09'
GROUP BY 
    s.id,
    items.total_qty,
    items.total_to_pay,
    payments.total_paid,
    produtos.descricao

ORDER BY CreatedAt DESC NULLS LAST;

-- ORDERS



/* POS */
/* POS */

SELECT * FROM tbUsers;
SELECT * FROM tbCashRegister;
SELECT * FROM tbCashRegisterDetails;

SELECT * FROM tbSales;
SELECT * FROM tbCustomers;

SELECT * FROM tbProducts;
SELECT * FROM tbOrders;

SELECT * FROM tbPaymentSales;

-----------------
CashRegister -> Sales -> Customer -> Orders -> PaymentSales
-----------------

INSERT INTO tbCashRegister (user_id)
VALUES ('333d55e0-cadc-4412-9da2-4045aa0c1510');

INSERT INTO tbCashRegisterDetails (cash_register_id, cash_name, amount, description, date_time)
VALUES ('a8a0f8eb-f7ad-4fbb-81fa-4566a385beb2', 'opened', 100, 'Caixa Aberto', NOW());

INSERT INTO tbSales (cash_register_id)
VALUES ('a8a0f8eb-f7ad-4fbb-81fa-4566a385beb2', 1200, 60);

INSERT INTO tbCustomers (sales_id)
VALUES ('4c6cd6bf-e266-4cb8-a02d-564489be83e5');

INSERT INTO tbOrders (sales_id, product_id, quantity, unit_price)
VALUES ('4c6cd6bf-e266-4cb8-a02d-564489be83e5', 'fe5ef222-31a0-46db-9929-821aa2a60873', 3, 140),
('4c6cd6bf-e266-4cb8-a02d-564489be83e5', 'a7dee670-a96e-4b0b-b65d-2728341b41c9', 1, 120),
('4c6cd6bf-e266-4cb8-a02d-564489be83e5', 'f86f69de-a5ec-4d79-a67e-4534f115f5ca', 60, 10);

INSERT INTO tbPaymentSales (sales_id, method, total_paid, total_amount)
VALUES ('4c6cd6bf-e266-4cb8-a02d-564489be83e5', 'cash', 1140);

UPDATE tbOrders SET status = 'paid' WHERE id = '31b66e0d-16b4-44d4-a057-3c366e67b062';
UPDATE tbOrders SET status = 'paid' WHERE id = '51ed46d9-2ee7-45fa-9bad-cc14ea697065';
UPDATE tbOrders SET status = 'paid' WHERE id = '488f93b8-19ef-463f-9664-f05aab832aa8';

DELETE FROM tbSales; -- tbCustomers, tbOrders, tbPaymentSales
DELETE FROM tbCustomers;
DELETE FROM tbOrders;
DELETE FROM tbPaymentSales;

/* POS */
/* POS */

/* REPORTS */
/* REPORTS */

-- (previousDate, currentDate) = '2025-12-03', '2025-12-04'
-- cards    ::  saldo inicial, entradas, saídas, formas de pagamento, saldo final, nr. de pedidos, saldo esperado, ticket médio
-- cards    ::  amount, percent, last updated
-- charts   :: amount[], date[]

-- saldo inicial, reforço   ::  tbCashRegisterDetails   - opened & cash in
-- entradas                 ::  tbOrders                - totalpay
-- saídas                   ::  tbCashRegisterDetails   - cash out
-- formas de pagamento      ::  tbPaymentSales
-- saldo final              ::  tbCashRegisterDetails   - closed
-- nr. pedidos              ::  tbOrders                - quantity
-- saldo esperado           ::  entradas - saídas
-- ticket médio             ::  entradas / nr. pedidos

-----------------------
select * from tbcashregisterdetails
-----------------------
-- amounts
SELECT
    init.Amount,
    trend.TrendPercentage,
    lst.LastUpdated
FROM
    (
        SELECT
            COALESCE(SUM(amount), 0) AS Amount
        FROM tbCashRegisterDetails
        WHERE date_time::DATE = '2025-12-02'
            AND cash_name IN ('opened', 'cash in')
            AND is_confirmed = TRUE
    ) AS init
CROSS JOIN
    (
        SELECT
            (
                ROUND
                    (
                        (
                            (
                                (
                                    COALESCE(SUM(amount) FILTER (
                                    WHERE date_time::DATE = '2025-12-04'
                                        AND cash_name IN ('opened', 'cash in')
                                        AND is_confirmed = TRUE
                                    ))
                                    -
                                    COALESCE(SUM(amount) FILTER (
                                        WHERE date_time::DATE = '2025-12-02'
                                            AND cash_name IN ('opened', 'cash in')
                                            AND is_confirmed = TRUE
                                    ))
                                )
                                /
                                COALESCE(SUM(amount) FILTER (
                                    WHERE date_time::DATE = '2025-12-03'
                                        AND cash_name IN ('opened', 'cash in')
                                        AND is_confirmed = TRUE
                                ))
                            )
                            *
                            100
                        ),0
                    )
            ) AS TrendPercentage
        FROM tbCashRegisterDetails
    ) AS trend
CROSS JOIN
    (
        SELECT
            date_time AS LastUpdated
        FROM tbCashRegisterDetails
        WHERE date_time::DATE = '2025-12-04'
            AND is_confirmed = TRUE
        ORDER BY date_time DESC
        LIMIT 1
    ) AS lst

-- charts
SELECT
    prevAmnt.PreviousAmnt,
    prevLst.PreviousDate,
    currAmnt.CurrentAmnt,
    currLst.CurrentDate
FROM
    (
        SELECT
            COALESCE(SUM(amount) FILTER (
                WHERE date_time::DATE = '2025-12-03'
                    AND cash_name IN ('opened', 'cash in')
                    AND is_confirmed = TRUE
            ), 0) AS PreviousAmnt
        FROM tbCashRegisterDetails
    ) AS prevAmnt   
CROSS JOIN
    (
        SELECT
            date_time AS PreviousDate
        FROM tbCashRegisterDetails
        WHERE date_time::DATE = '2025-12-03'
            AND is_confirmed = TRUE
        ORDER BY date_time DESC
        LIMIT 1
    ) AS prevLst 
CROSS JOIN
    (
        SELECT
            COALESCE(SUM(amount) FILTER (
                WHERE date_time::DATE = '2025-12-04'
                    AND cash_name IN ('opened', 'cash in')
                    AND is_confirmed = TRUE
            )) AS CurrentAmnt
        FROM tbCashRegisterDetails
    ) AS currAmnt
CROSS JOIN
    (
        SELECT
            date_time AS CurrentDate
        FROM tbCashRegisterDetails
        WHERE date_time::DATE = '2025-12-04'
            AND is_confirmed = TRUE
        ORDER BY date_time DESC
        LIMIT 1
    ) AS currLst

-- initial balance
-- LastUpdated, TotalAmount, Date
select * from tbcashregisterdetails

WITH params AS
(
    SELECT
        '2025-12-05'::date AS prev_date,
        '2025-12-06'::date AS curr_date
),
data AS 
(
    SELECT
        date_time::date AS trx_date,
        date_time AS trx_time,
        amount
    FROM tbCashRegisterDetails
    WHERE date_time::date IN (SELECT prev_date FROM params UNION ALL SELECT curr_date FROM params)
        AND cash_name IN ('opened', 'cash in')
        AND is_confirmed = true
),
daily AS 
(
    SELECT
        trx_date,
        SUM(amount) AS total_amount,
        MAX(trx_time) AS last_update
    FROM data
    GROUP BY trx_date
),
pivot AS 
(
    SELECT
        COALESCE(MAX(CASE WHEN trx_date = (SELECT prev_date FROM params) THEN total_amount END), 0) AS prev_total,
        COALESCE(MAX(CASE WHEN trx_date = (SELECT curr_date FROM params) THEN total_amount END), 0) AS curr_total,
        MAX(CASE WHEN trx_date = (SELECT prev_date FROM params) THEN last_update END) AS prev_update,
        MAX(CASE WHEN trx_date = (SELECT curr_date FROM params) THEN last_update END) AS curr_update
    FROM daily
)
SELECT
    COALESCE(p.curr_update, p.prev_update) AS LastUpdated,
        ARRAY[p.prev_total, p.curr_total] AS TotalAmount,
        ARRAY[
            TO_CHAR((SELECT prev_date FROM params), 'yyyy-MM-dd'),
            TO_CHAR((SELECT curr_date FROM params), 'yyyy-MM-dd')
        ] AS Date
FROM pivot p;
-- initial balance

-- inflows
-- LastUpdated, TotalAmount, Date
select * from tborders;

WITH params AS
(
    SELECT
        '2025-12-04'::date AS prev_date,
        '2025-12-05'::date AS curr_date
),
data AS
(
    SELECT
        created_at::date AS trx_date,
        created_at AS trx_time,
        total_to_pay
    FROM tbOrders
    WHERE created_at::date IN (SELECT prev_date FROM params UNION ALL SELECT curr_date FROM params)
        AND is_available = TRUE
        AND status = 'paid'
),
daily AS
(
    SELECT
        trx_date,
        SUM(total_to_pay) AS total_amount,
        MAX(trx_time) AS last_updated
    FROM data
    GROUP BY trx_date
),
pivot AS
(
    SELECT
        COALESCE(MAX(CASE WHEN trx_date = (SELECT prev_date FROM params) THEN total_amount END), 0) AS prev_total,
        COALESCE(MAX(CASE WHEN trx_date = (SELECT curr_date FROM params) THEN total_amount END), 0) AS curr_total,
        MAX(CASE WHEN trx_date = (SELECT prev_date FROM params) THEN last_updated END) AS prev_updated,
        MAX(CASE WHEN trx_date = (SELECT curr_date FROM params) THEN last_updated END) AS curr_updated
    FROM daily
)
SELECT
    COALESCE(p.curr_updated, p.prev_updated) AS LastUpdated,
    ARRAY[p.prev_total, p.curr_total] AS TotalAmount,
    ARRAY
    [
        TO_CHAR((SELECT prev_date FROM params), 'yyyy-MM-dd'),
        TO_CHAR((SELECT curr_date FROM params), 'yyyy-MM-dd')
    ] AS Date
FROM pivot p;
-- inflows

-- outflows
-- LastUpdated, TotalAmount, Date
select * from tbcashregisterdetails

WITH params AS
(
    SELECT
        '2025-12-04'::date AS prev_date,
        '2025-12-05'::date AS curr_date
),
data AS 
(
    SELECT
        date_time::date AS trx_date,
        date_time AS trx_time,
        amount
    FROM tbCashRegisterDetails
    WHERE date_time::date IN (SELECT prev_date FROM params UNION ALL SELECT curr_date FROM params)
        AND cash_name = 'cash out'
        AND is_confirmed = true
),
daily AS 
(
    SELECT
        trx_date,
        SUM(amount) AS total_amount,
        MAX(trx_time) AS last_update
    FROM data
    GROUP BY trx_date
),
pivot AS 
(
    SELECT
        COALESCE(MAX(CASE WHEN trx_date = (SELECT prev_date FROM params) THEN total_amount END), 0) AS prev_total,
        COALESCE(MAX(CASE WHEN trx_date = (SELECT curr_date FROM params) THEN total_amount END), 0) AS curr_total,
        MAX(CASE WHEN trx_date = (SELECT prev_date FROM params) THEN last_update END) AS prev_update,
        MAX(CASE WHEN trx_date = (SELECT curr_date FROM params) THEN last_update END) AS curr_update
    FROM daily
)
SELECT
    COALESCE(p.curr_update, p.prev_update) AS LastUpdated,
        ARRAY[p.prev_total, p.curr_total] AS TotalAmount,
        ARRAY[
            TO_CHAR((SELECT prev_date FROM params), 'yyyy-MM-dd'),
            TO_CHAR((SELECT curr_date FROM params), 'yyyy-MM-dd')
        ] AS Date
FROM pivot p;
-- outflows

-- closing balance
-- LastUpdated, TotalAmount, Date
select * from tbcashregisterdetails

WITH params AS
(
    SELECT
        '2025-12-05'::date AS prev_date,
        '2025-12-06'::date AS curr_date
),
data AS 
(
    SELECT
        date_time::date AS trx_date,
        date_time AS trx_time,
        amount
    FROM tbCashRegisterDetails
    WHERE date_time::date IN (SELECT prev_date FROM params UNION ALL SELECT curr_date FROM params)
        AND cash_name = 'closed'
        AND is_confirmed = true
),
daily AS 
(
    SELECT
        trx_date,
        SUM(amount) AS total_amount,
        MAX(trx_time) AS last_update
    FROM data
    GROUP BY trx_date
),
pivot AS 
(
    SELECT
        COALESCE(MAX(CASE WHEN trx_date = (SELECT prev_date FROM params) THEN total_amount END), 0) AS prev_total,
        COALESCE(MAX(CASE WHEN trx_date = (SELECT curr_date FROM params) THEN total_amount END), 0) AS curr_total,
        MAX(CASE WHEN trx_date = (SELECT prev_date FROM params) THEN last_update END) AS prev_update,
        MAX(CASE WHEN trx_date = (SELECT curr_date FROM params) THEN last_update END) AS curr_update
    FROM daily
)
SELECT
    COALESCE(p.curr_update, p.prev_update) AS LastUpdated,
        ARRAY[p.prev_total, p.curr_total] AS TotalAmount,
        ARRAY[
            TO_CHAR((SELECT prev_date FROM params), 'yyyy-MM-dd'),
            TO_CHAR((SELECT curr_date FROM params), 'yyyy-MM-dd')
        ] AS Date
FROM pivot p;
-- closing balance

-- number of sales
-- LastUpdated, TotalAmount, Date
select * from tborders;

WITH params AS
(
    SELECT
        '2025-12-08'::date AS prev_date,
        '2025-12-09'::date AS curr_date
),
data AS
(
    SELECT
        created_at::date AS trx_date,
        created_at AS trx_time
    FROM tbOrders
    WHERE created_at::date IN (SELECT prev_date FROM params UNION ALL SELECT curr_date FROM params)
      AND is_available = TRUE
      AND status = 'paid'
),
daily AS
(
    SELECT
        trx_date,
        COUNT(*) AS total_sales,
        MAX(trx_time) AS last_updated
    FROM data
    GROUP BY trx_date
),
pivot AS
(
    SELECT
        COALESCE(MAX(CASE WHEN trx_date = (SELECT prev_date FROM params) THEN total_sales END), 0) AS prev_total,
        COALESCE(MAX(CASE WHEN trx_date = (SELECT curr_date FROM params) THEN total_sales END), 0) AS curr_total,
        MAX(CASE WHEN trx_date = (SELECT prev_date FROM params) THEN last_updated END) AS prev_updated,
        MAX(CASE WHEN trx_date = (SELECT curr_date FROM params) THEN last_updated END) AS curr_updated
    FROM daily
)
SELECT
    COALESCE(p.curr_updated, p.prev_updated) AS "LastUpdated",
    ARRAY[p.prev_total, p.curr_total] AS "TotalAmount",
    ARRAY[
        TO_CHAR((SELECT prev_date FROM params), 'YYYY-MM-DD'),
        TO_CHAR((SELECT curr_date FROM params), 'YYYY-MM-DD')
    ] AS "Date"
FROM pivot p;
-- number of sales

-- expected balance
-- LastUpdated, TotalAmount, Date
-- entradas - saídas

WITH params AS (
    SELECT
        '2025-12-04'::date AS prev_date,
        '2025-12-05'::date AS curr_date
),
inflows AS (
    SELECT
        created_at::date AS trx_date,
        created_at AS trx_time,
        total_to_pay AS amount
    FROM tbOrders
    WHERE created_at::date IN (SELECT prev_date FROM params UNION ALL SELECT curr_date FROM params)
      AND is_available = TRUE
      AND status = 'paid'
),
inflows_daily AS (
    SELECT
        trx_date,
        COALESCE(SUM(amount), 0) AS total_in,
        MAX(trx_time) AS last_in
    FROM inflows
    GROUP BY trx_date
),
outflows AS (
    SELECT
        date_time::date AS trx_date,
        date_time AS trx_time,
        amount
    FROM tbCashRegisterDetails
    WHERE date_time::date IN (SELECT prev_date FROM params UNION ALL SELECT curr_date FROM params)
      AND cash_name = 'cash out'
      AND is_confirmed = true
),
outflows_daily AS (
    SELECT
        trx_date,
        COALESCE(SUM(amount), 0) AS total_out,
        MAX(trx_time) AS last_out
    FROM outflows
    GROUP BY trx_date
),
combined AS (
    SELECT
        d.trx_date,
        COALESCE(i.total_in, 0) AS inflows,
        COALESCE(o.total_out, 0) AS outflows,
        GREATEST(COALESCE(i.last_in, '1970-01-01'::timestamp),
                 COALESCE(o.last_out, '1970-01-01'::timestamp)) AS last_updated
    FROM (
        SELECT prev_date AS trx_date FROM params
        UNION ALL
        SELECT curr_date AS trx_date FROM params
    ) d
    LEFT JOIN inflows_daily i ON i.trx_date = d.trx_date
    LEFT JOIN outflows_daily o ON o.trx_date = d.trx_date
),
final AS (
    SELECT
        MAX(last_updated) AS "LastUpdated",
        ARRAY[
            MAX(CASE WHEN trx_date = (SELECT prev_date FROM params)
                     THEN inflows - outflows END),
            MAX(CASE WHEN trx_date = (SELECT curr_date FROM params)
                     THEN inflows - outflows END)
        ] AS totalamount,
        ARRAY[
            TO_CHAR((SELECT prev_date FROM params), 'YYYY-MM-DD'),
            TO_CHAR((SELECT curr_date FROM params), 'YYYY-MM-DD')
        ] AS date
    FROM combined
)
SELECT 
    "LastUpdated",
    totalamount,
    date
FROM final;
-- expected balance

-- average ticket
-- LastUpdated, TotalAmount, Date
-- entradas / number of orders
select * from tborders

WITH params AS
(
    SELECT
        '2025-12-04'::date AS prev_date,
        '2025-12-05'::date AS curr_date
),
inflows_raw AS
(
    SELECT
        created_at::date AS trx_date,
        created_at AS trx_time,
        total_to_pay
    FROM tbOrders
    WHERE created_at::date IN (SELECT prev_date FROM params UNION ALL SELECT curr_date FROM params)
      AND is_available = TRUE
      AND status = 'paid'
),
inflows_daily AS
(
    SELECT
        trx_date,
        SUM(total_to_pay) AS inflow_amount,
        MAX(trx_time) AS inflow_last
    FROM inflows_raw
    GROUP BY trx_date
),
sales_raw AS
(
    SELECT
        created_at::date AS trx_date,
        created_at AS trx_time,
        1 AS sale
    FROM tbOrders
    WHERE created_at::date IN (SELECT prev_date FROM params UNION ALL SELECT curr_date FROM params)
      AND is_available = TRUE
      AND status = 'paid'
),
sales_daily AS
(
    SELECT
        trx_date,
        COUNT(*) AS total_sales,
        MAX(trx_time) AS sales_last
    FROM sales_raw
    GROUP BY trx_date
),
combined AS
(
    SELECT
        d.trx_date,
        COALESCE(i.inflow_amount, 0) AS inflows,
        COALESCE(s.total_sales, 0) AS sales,
        GREATEST(COALESCE(i.inflow_last, '1970-01-01'::timestamp),
                 COALESCE(s.sales_last, '1970-01-01'::timestamp)) AS last_updated
    FROM
    (
        SELECT prev_date AS trx_date FROM params
        UNION ALL
        SELECT curr_date AS trx_date FROM params
    ) d
    LEFT JOIN inflows_daily i ON i.trx_date = d.trx_date
    LEFT JOIN sales_daily s ON s.trx_date = d.trx_date
),
ticket AS
(
    SELECT
        ROUND
        (
            COALESCE(MAX(CASE WHEN trx_date = (SELECT prev_date FROM params) THEN inflows END), 0) /
            NULLIF(MAX(CASE WHEN trx_date = (SELECT prev_date FROM params) THEN sales END), 0)
            ,2
        ) AS prev_ticket,

        ROUND
        (
            COALESCE(MAX(CASE WHEN trx_date = (SELECT curr_date FROM params) THEN inflows END), 0) /
            NULLIF(MAX(CASE WHEN trx_date = (SELECT curr_date FROM params) THEN sales END), 0)
            , 2
        ) AS curr_ticket,

        MAX(last_updated) AS last_updated
    FROM combined
)
SELECT
    ticket.last_updated AS "LastUpdated",
    ARRAY[ticket.prev_ticket, ticket.curr_ticket] AS "TotalAmount",
    ARRAY
    [
        TO_CHAR((SELECT prev_date FROM params), 'YYYY-MM-DD'),
        TO_CHAR((SELECT curr_date FROM params), 'YYYY-MM-DD')
    ] AS "Date"
FROM ticket;
-- average ticket

-- payment method
-- LastUpdated, TotalAmount, Date
select * from tbpaymentsales;
select * from tborders;
select * from tbsales;

SELECT
    o.sales_id,
    ps.method,
    o.total_to_pay
FROM tbOrders o
INNER JOIN tbPaymentSales ps
    ON ps.sales_id = o.sales_id
WHERE o.is_available = TRUE
    AND o.status = 'paid'
    AND ps.is_paid = TRUE
    AND ps.created_at::DATE = '2025-12-05'
-- ===================================

SELECT ARRAY
[
    COALESCE(SUM(o.total_to_pay) FILTER(WHERE ps.method = 'cash'), 0),
    COALESCE(SUM(o.total_to_pay) FILTER(WHERE ps.method = 'eMola'), 0),
    COALESCE(SUM(o.total_to_pay) FILTER(WHERE ps.method = 'mPesa'), 0)
] AS Amounts
FROM tbOrders o
INNER JOIN tbPaymentSales ps
    ON ps.sales_id = o.sales_id
WHERE o.is_available = TRUE
    AND o.status = 'paid'
    AND ps.is_paid = TRUE
    AND ps.created_at::DATE = '2025-12-09'

-- payment method

-- chart sales per hour
-- charts   :: amount[], date[]
select * from tborders;

SELECT
    ARRAY_AGG(total_to_pay ORDER BY created_at) AS Amounts,
    ARRAY_AGG(
        to_char(created_at, 'HH24:MI')
        ORDER BY created_at
    ) AS Date
FROM tbOrders
WHERE is_available = TRUE
  AND status = 'paid'
  AND created_at::DATE = '2025-12-08';
-- chart sales per hour

/* REPORTS */
/* REPORTS */


/* RECENT SALES */
/* RECENT SALES */
-- order number paid, ARRAY(payment method), order description, order total amount, order time paid, order customer name
select * from tbpaymentsales
SELECT COUNT(*) AS Total FROM tbSales
select * from tbsales;
select * from tborders;
select * from tbcashregister
select * from tbcashregisterdetails

SELECT
    o.order_number,
    ARRAY_AGG(ps.method ORDER BY ps.created_at) AS methods
FROM tbOrders o
INNER JOIN tbSales s ON s.id = o.sales_id
INNER JOIN tbPaymentSales ps ON ps.sales_id = o.sales_id
GROUP BY o.order_number;

-- ==========================================

SELECT
    s.id AS Id,
    order_info.order_number AS OrderNumber,
    payments.methods        AS Methods,
    COALESCE(items.total_to_pay, 0.00)     AS TotalPay,
    COALESCE(produtos.descricao, 'Sem itens') AS Description,
    c.fullName AS CustomerName,
    payments.last_payment_at AS Time

FROM tbSales s
INNER JOIN tbCashRegister cr         ON cr.id = s.cash_register_id
INNER JOIN tbCashRegisterDetails crd ON crd.cash_register_id = cr.id
INNER JOIN tbCustomers c             ON c.sales_id = s.id

LEFT JOIN LATERAL (
    SELECT 
        o.order_number
    FROM tbOrders o
    WHERE o.sales_id = s.id
      AND o.status = 'paid'
    ORDER BY o.created_at DESC
    LIMIT 1
) order_info ON TRUE

LEFT JOIN LATERAL (
    SELECT SUM(o.total_to_pay) AS total_to_pay
    FROM tbOrders o
    WHERE o.sales_id = s.id
      AND o.status = 'paid'
) items ON TRUE

LEFT JOIN LATERAL (
    SELECT 
        ARRAY_AGG(ps.method ORDER BY ps.created_at) AS methods,
        TO_CHAR(MAX(ps.created_at), 'HH24:MI') AS last_payment_at
    FROM tbPaymentSales ps
    WHERE ps.sales_id = s.id
      AND ps.is_paid = TRUE
      AND ps.created_at::DATE = '2025-12-10'
) payments ON TRUE

LEFT JOIN LATERAL (
    SELECT STRING_AGG(qtd_nome, ' + ' ORDER BY qtd_nome) AS descricao
    FROM (
        SELECT DISTINCT
            o.quantity || 'X ' || p.item_name AS qtd_nome
        FROM tbOrders o
        JOIN tbProducts p ON p.id = o.product_id
        WHERE o.sales_id = s.id
          AND o.status = 'paid'
    ) sub
) produtos ON TRUE

WHERE payments.last_payment_at IS NOT NULL

GROUP BY 
    s.id,
    order_info.order_number,
    items.total_to_pay,
    payments.methods,
    payments.last_payment_at,
    produtos.descricao,
    c.fullName

ORDER BY order_info.order_number DESC NULLS LAST;


/* RECENT SALES */
/* RECENT SALES */