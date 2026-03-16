<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$data = [
    "status" => "success",
    "message" => "API PHP connected successfully"
];

echo json_encode($data);