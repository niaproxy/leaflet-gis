 <?php
$data = $_POST['jsonString'];
//set mode of file to writable.
chmod("json/data.geojson",0777);
$f = fopen("json/data.geojson", "w+") or die("fopen failed");
fwrite($f, $data);
fclose($f);
?>
