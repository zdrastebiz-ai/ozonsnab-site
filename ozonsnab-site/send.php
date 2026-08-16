<?php
/* Обработчик заявок: отправка в Telegram и на почту */
header('Content-Type: application/json; charset=utf-8');

$BOT_TOKEN = '8613125715:AAERlL9w2A0mtYvEjSDyp6PQajOYTgj0bMs';
$CHAT_ID   = '302016004';
$TO_EMAIL  = 'ozonsnab@bk.ru';

/* ----- Защита: запрашиваем только POST ----- */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Метод не поддерживается']);
    exit;
}

/* ----- Собираем данные ----- */
function clean($v) {
    $v = trim($v ?? '');
    $v = str_replace(["\r", "\n"], ' ', $v);
    return mb_substr($v, 0, 500, 'UTF-8');
}

$name    = clean($_POST['name'] ?? '');
$phone   = clean($_POST['phone'] ?? '');
$email   = clean($_POST['email'] ?? '');
$city    = clean($_POST['city'] ?? '');
$details = clean($_POST['details'] ?? '');

/* ----- Валидация: обязательны Имя и E-mail ----- */
if (mb_strlen($name, 'UTF-8') < 2) {
    echo json_encode(['ok' => false, 'error' => 'Укажите имя']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['ok' => false, 'error' => 'Укажите корректный e-mail']);
    exit;
}
$phoneDigits = preg_replace('/\D/', '', $phone);
if ($phoneDigits !== '' && mb_strlen($phoneDigits, 'UTF-8') < 11) {
    echo json_encode(['ok' => false, 'error' => 'Укажите полный номер телефона']);
    exit;
}

/* ----- Текст заявки ----- */
$date = date('d.m.Y H:i');
$message = "Новая заявка с сайта ozonsnab.ru\n"
    . "Дата: $date\n\n"
    . "Имя: $name\n"
    . "Телефон: " . ($phone ? $phone : '—') . "\n"
    . "E-mail: $email\n"
    . "Город: " . ($city ? $city : '—') . "\n"
    . "Подробности: " . ($details ? $details : '—');

/* ----- Отправка в Telegram ----- */
$tgOk = false;
$tgData = json_encode([
    'chat_id'    => $CHAT_ID,
    'text'       => $message,
    'parse_mode' => 'HTML'
], JSON_UNESCAPED_UNICODE);

$ch = curl_init('https://api.telegram.org/bot' . $BOT_TOKEN . '/sendMessage');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $tgData);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
$tgResponse = curl_exec($ch);
$tgHttp = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$tgOk = $tgHttp === 200;

/* ----- Отправка на почту ----- */
$mailOk = false;
$subject = '=?UTF-8?B?' . base64_encode('Заявка с сайта ozonsnab.ru') . '?=';
$headers = "MIME-Version: 1.0\r\n"
    . "Content-type: text/plain; charset=utf-8\r\n"
    . "From: no-reply@ozonsnab.ru\r\n"
    . "Reply-To: $email\r\n";
$bodyMail = mb_convert_encoding($message, 'UTF-8', 'UTF-8');
$mailOk = @mail($TO_EMAIL, $subject, $bodyMail, $headers);

/* ----- Ответ ----- */
if ($tgOk) {
    echo json_encode(['ok' => true, 'via' => 'telegram'], JSON_UNESCAPED_UNICODE);
} elseif ($mailOk) {
    echo json_encode(['ok' => true, 'via' => 'email'], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Не удалось отправить заявку, попробуйте позже'], JSON_UNESCAPED_UNICODE);
}
