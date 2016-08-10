<?php
if(isset($_POST["submit"])){
    //Connect to the database
    $host = "0.0.0.0";
    $user = "kardosa93";                     //Your Cloud 9 username
    $pass = "";                                  //Remember, there is NO password by default!
    $db = "c9";                                  //Your database name you want to connect to
    $port = 3306;                                //The port #. It is always 3306
    
    $connection = mysqli_connect($host, $user, $pass, $db, $port)or die(mysql_error());

    $sql = "INSERT INTO `c9`.`feedback` (`id`,`name`,`email`,`comment`) VALUES ( NULL, '".$_POST["name"]."','".$_POST["email"]."','".$_POST["info"]."')";

    if ($connection->query($sql) === TRUE) {
    echo "<script type= 'text/javascript'>alert('New record created successfully');</script>";
    } else {
    echo "<script type= 'text/javascript'>alert('Error: " . $sql . "<br>" . $connection->error."');</script>";
    }
    
    $connection->close();
    
    $ch = curl_init("https://hproject-kardosa93.c9users.io/submit.html");
	curl_exec($ch);
}
?>