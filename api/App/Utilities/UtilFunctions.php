<?php 
    namespace App\Utilities;

    use Slim\Http\UploadedFile;
    use App\DAO\MySQL\HouseOfBarber\AutenticarDAO;
    use App\Models\MySQL\HouseOfBarber\AutenticarModel;

    abstract class UtilFunctions{
        public static function moveUploadedFile($directory, UploadedFile $uploadedFile): string
        {
            $extension = pathinfo($uploadedFile->getClientFilename(), PATHINFO_EXTENSION);
            $basename = bin2hex(random_bytes(8).uniqid());
            $filename = sprintf('%s.%0.8s', $basename, $extension);
            $filePath = $directory . DIRECTORY_SEPARATOR . $filename;

            $uploadedFile->moveTo($filePath);

            $width = 328;
            $height = 215;

            switch ($extension) {
                case 'png':
                    $sourceImage = imagecreatefrompng($filePath);
                    break;
                case 'jpeg' || 'jpg':
                    $sourceImage = imagecreatefromjpeg($filePath);
                    break;
                default:
                    return false;
            }

            $destinationImage = imagecreatetruecolor($width, $height);
            imagecopyresampled($destinationImage, $sourceImage, 0, 0, 0, 0, $width, $height, imagesx($sourceImage), imagesy($sourceImage));

            $resizedFilename = 'resized_' . $filename;
            $resizedImagePath = $directory . DIRECTORY_SEPARATOR . $resizedFilename;

            switch ($extension) {
                case 'png':
                    imagepng($destinationImage, $resizedImagePath);
                    break;
                case 'jpeg' || 'jpg':
                    imagejpeg($destinationImage, $resizedImagePath);
                    break;
                default:
                    return false;
            }

            imagedestroy($sourceImage);
            imagedestroy($destinationImage);

            return $filename;
        }

        public static function userAuth(string $perfil, string $senha, array $userData): array
        {
            if($userData && count($userData) > 0){
                $hashSenha = $userData[0]['senha'];
                $idUsuario = $userData[0]['id'];

                if(password_verify($senha, $hashSenha)){
                    $token = md5(uniqid() . mt_rand());

                    $autenticarModel = new AutenticarModel();
                    $autenticarDAO = new AutenticarDAO();

                    $autenticarModel->setIdUsuario($idUsuario);
                    $autenticarModel->setPerfil($perfil);
                    $autenticarModel->setToken($token);

                    $queryStatus = $autenticarDAO->insertToken($autenticarModel);

                    if($queryStatus){
                        unset($userData[0]['senha']);

                        return [
                            "message" => "Autenticado com sucesso",
                            "token" => $token,
                            "duration" => "Até o final do dia vigente",
                            "type_access" => $perfil,
                            "error" => "false"
                        ];
                    }
                    else{
                       return [
                            "message" => "Ooops, houve um erro interno ao logar. Entre em contato com o administrador",
                            "error" => "true"
                        ];
                    }
                }
                else{
                    return [
                        "message" => "Senha incorreta",
                        "error" => "true"
                    ];
                }
            }
            else{
                $typeAccess = $perfil == "ESTABELECIMENTO" ? "Estabelecimento" : "Cliente";

                return [
                    "message" => "$typeAccess não cadastrado. Por favor, realize seu cadastro.",
                    "error" => "true"
                ];
            }
        }
    }