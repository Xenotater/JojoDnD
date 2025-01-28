<?php
  if ($_POST["action"] != "update") {
    header("Location: /");
    exit;
  }

  if (session_start() && $_SESSION["checkedUpdate"])
  exit;

  $_SESSION["checkedUpdate"] = true;

  $version = $_POST["version"];
  $latest = "1.12.3.0";

  if ($version != $latest) {
    header("Clear-Site-Data: \"cache\"");
    echo "updated";
  }

  exit;
?>