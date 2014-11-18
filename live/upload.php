<?php

/*
TODO:
* Intro/explanation popup (like mapshaper)
* pass final geojson back to map!
* Show Example Projection-guessing.

*/

//'db' => require($TMP_DIR . '/db.php'),
//$dbconn => require($TMP_DIR . '/db.php'),

require ('config.php');

$BASE_URL = 'http://'.$_SERVER['HTTP_HOST'].dirname($_SERVER['PHP_SELF']);

if( empty($_FILES['file']) ) {
    return print "Don't forget to upload a file";
}    
$filename = basename($_FILES['file']['name']);
$datetime = date('Y_m_d_H_i_s');
$ext = substr($filename, strrpos($filename, '.') + 1);
if ( !($ext == "zip") || ($_FILES['file']['size'] > 9000000) ) { // 99 mb
    return print "Files must be zipped and under 9 MB.";
}
//Determine the path to which we want to save this file
//$newname = $TMP_DIR.'/upload/'.$filename;
$TMP_DIR = '/var/www/images.tmp/prj/'.$datetime.'/';
chdir('/var/www/images.tmp/prj'.'/');

//echo "\r\n---$TMP_DIR---\r\n";
if (!file_exists($TMP_DIR)) {
    mkdir($TMP_DIR, 0777, true);
}
$newname = $TMP_DIR.$datetime.'_CUSTOM.zip';
//Attempt to move the uploaded file to it's new place
if ( ( move_uploaded_file($_FILES['file']['tmp_name'],$newname) ) ) {
   //echo "The file has been saved as: ".$newname;
   $zip = new ZipArchive;
   if ( $zip->open($newname)) {
        $zip->extractTo($TMP_DIR);
        
        for ( $i=0; $i < $zip->numFiles; $i++ ) {
            $entry = $zip->getNameIndex($i); 
            //echo "entry: $entry";
            $ext = pathinfo($entry, PATHINFO_EXTENSION);
            if ($ext === 'shp') {
                $CUSTOM_filepath = $TMP_DIR . $entry;                   
            }
            if ($ext === 'prj') {
                unlink($TMP_DIR . $entry);  
            }
        }
    }
} else {
    echo "Error: A problem occurred during file upload!";
};

// One at a time! TODO: multi-user
//$data_dir = '/var/www/images.tmp';
//chdir($data_dir);
$data_dir = $TMP_DIR.'/';

$ogr2 = '/usr/local/gdal-1.11/bin/ogr2ogr';
$ogri = '/usr/local/gdal-1.11/bin/ogrinfo';

$OUT_FILE = $TMP_DIR.'/projnesser.geojson';
//$spat_ref_sys = $TMP_DIR.'/spatial_ref_sys_copy.shp';


$cmd = 'cd ' . $TMP_DIR . '/';
`$cmd`;

// Todo: 1. create unions/dissolve of uploaded shp
// Copy/overwrite the uploaded file with unknown filename to a hard-coded one, projnesser.shp
// $cmd = "$ogr2 projnesser.shp -overwrite $CUSTOM_filepath -nlt MULTIPOLYGON -a_srs epsg:4326";

/*
numeric field overflow problem
ERROR:  numeric field overflow
DETAIL:  A field with precision 13, scale 6 must round to an absolute value less than 10^7.
Thanks Frank! http://lists.maptools.org/pipermail/fwtools/2005-September/000148.html
*/
    
$cmd = "$ogr2 projnesser.shp -overwrite $CUSTOM_filepath -nlt MULTIPOLYGON -a_srs epsg:26913"; // 26913 = utm 13 (colorado)
//echo $cmd;
// /usr/local/gdal-1.11/bin/ogr2ogr projnesser.shp -overwrite -lco PRECISION=NO /var/www/images.tmp/prj/2014_10_03_17_32_46/baca.shp -nlt MULTIPOLYGON -a_srs epsg:26913
`$cmd`;


try {
  $dbh = new PDO("pgsql:host='localhost';dbname=$DB_NAME", $USER, $PASSWORD); 
  # SQLite Database
  //$DBH = new PDO("sqlite:my/database/path/database.db");
}
catch(PDOException $e) {
    echo $e->getMessage();
}

    // load shp to postgis
    $cmd = "$ogr2  -lco PRECISION=NO PG:'dbname=$DB_NAME password=$PASSWORD user=$USER' -update -append projnesser.shp -overwrite -nlt MULTIPOLYGON -a_srs epsg:3857"; // 26913 = utm 13 (colorado)
    `$cmd`;

    $sql = "ALTER TABLE projnesser ADD COLUMN srid integer";
    $count = $dbh->exec( $sql );

    $sql = "ALTER TABLE projnesser ADD COLUMN srtext text DEFAULT ''";
    $count = $dbh->exec( $sql );

    $sql = "ALTER TABLE projnesser ADD COLUMN proj4text text DEFAULT ''";
    $count = $dbh->exec( $sql );

    $sql = "ALTER TABLE projnesser ADD COLUMN val_int integer";
    $count = $dbh->exec( $sql );
    
    $sql = "ALTER TABLE projnesser ADD COLUMN m_wide numeric DEFAULT 0";
    $count = $dbh->exec( $sql );
    
    $sql = "ALTER TABLE projnesser ADD COLUMN goodevil varchar(10) DEFAULT 'dunno'";
    $count = $dbh->exec( $sql );


    // Merge srids into shp
    $sql = "INSERT INTO projnesser (srid, proj4text, srtext) SELECT srid, proj4text, srtext FROM spatial_ref_sys WHERE srtext not like '%deprecated%' ";
    $count = $dbh->exec( $sql );

    // copy unknown geom to all other rows
    $sql = "UPDATE projnesser SET wkb_geometry = (SELECT wkb_geometry FROM projnesser WHERE wkb_geometry IS NOT NULL LIMIT 1)";
    $count = $dbh->exec( $sql );

    // add geom column
    $sql = "SELECT AddGeometryColumn ('projnesser','polygon3857',3857,'MULTIPOLYGON',2);";
    $count = $dbh->exec( $sql );

    // do the transforms!
    $sql = "UPDATE projnesser SET polygon3857 =  try_projection2( wkb_geometry, srid );";
    $count = $dbh->exec( $sql );

    // Find ones that span the globe
    // width = ST_XMax(ST_Extent(polygon3857)) - ST_XMin(ST_Extent(polygon3857))
    $sql = "UPDATE projnesser SET m_wide = ST_XMax(ST_Envelope(polygon3857)) - ST_XMin(ST_Envelope(polygon3857)) "; // circumf of earth ~ 40,075 km
    $count = $dbh->exec( $sql );
    
    // Mark them evil cuz they're ugly. Also, wrong.
    $sql = "UPDATE projnesser SET goodevil = 'Evil' WHERE ST_XMax(ST_Envelope(polygon3857)) - ST_XMin(ST_Envelope(polygon3857)) > 39000000 "; // circumf of earth ~ 40,075 km
    $count = $dbh->exec( $sql );

    // ~438 GEOGCS (unprojected CRS) which get in the way
    $sql = "UPDATE projnesser SET goodevil = 'Evil' WHERE srtext like 'GEOGCS%' and srid not in (4326,4267,4269) "; // might refine to not make evil where proj4text not ilike '%+towgs84=0,0,0%' or ...
    $count = $dbh->exec( $sql );

    // add geog column 
    // http://blog.cleverelephant.ca/2009/11/postgis-gets-spherical-directors-cut.html
    $sql = "ALTER TABLE projnesser ADD COLUMN geog geography";
    $count = $dbh->exec( $sql );
   
    $sql = "UPDATE projnesser SET geog = geography(st_transform( polygon3857, 4326)) "; // WHERE goodevil <> 'Evil'";
    $count = $dbh->exec( $sql );
   
    // add sq km field and calculate it
    // http://epsg.io/9835-method (Lambert Cylindrical Equal Area, ellipsoidal; often not in proj4)
    // http://epsg.io/3975 (WGS 84 / NSIDC EASE-Grid Global; )
    $sql = "ALTER TABLE projnesser ADD COLUMN sqkm numeric";
    $count = $dbh->exec( $sql );
    //$sql = "UPDATE projnesser SET sqkm_9835 = ST_Area(ST_Transform(polygon3857,9835))/1000000";
    $sql = "UPDATE projnesser SET sqkm = ST_Area(geog)/1000000";
    $count = $dbh->exec( $sql );
    // select min(sqkm), max(sqkm) from projnesser;

    $cmd = " /usr/local/gdal-1.11/bin/ogr2ogr -f geojson $OUT_FILE PG:'dbname=$DB_NAME password=$PASSWORD user=$USER' projnesser -sql \"SELECT polygon3857 as geometry, srid, proj4text, srtext, sqkm FROM projnesser WHERE polygon3857 IS NOT NULL AND goodevil <> 'Evil' ORDER BY srid \" -lco COORDINATE_PRECISION=3 -t_srs epsg:4326"; // where val_int=1' ";
    //echo $cmd;
    `$cmd`;


    $fgc_geojson = file_get_contents($OUT_FILE);
    header('Content-Type: application/json');
    echo "$fgc_geojson";

    exit();
/*
Put this function in the db:
CREATE OR REPLACE FUNCTION try_projection2(my_polygon geometry, srid integer) returns geometry as $$
    DECLARE geom GEOMETRY;
    BEGIN
        geom := ST_Transform(ST_SetSRID(my_polygon,srid),3857);
        RETURN geom;
    exception when others then 
        RETURN NULL;
    END;
$$ language plpgsql;
*/


?>

