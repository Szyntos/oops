package backend.utils

import backend.files.FileEntity
import backend.users.Users
import backend.users.UsersRepository
import backend.users.UsersRoles
import org.springframework.stereotype.Component
import java.io.BufferedReader
import java.io.File
import java.io.FileInputStream
import java.io.InputStreamReader
import java.nio.charset.Charset
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths

@Component
class CsvReader(
    private val usersRepository: UsersRepository
) {
    fun getUsersFromCsv(file: FileEntity): List<Users> {
        val users = mutableListOf<Users>()
        val csvFile = File(file.pathToFile)
        if (!csvFile.exists() || !csvFile.isFile) {
            throw IllegalArgumentException("Plik CSV nie istnieje: '${file.fileName}'")
        }

        val reader = BufferedReader(InputStreamReader(FileInputStream(file.pathToFile), StandardCharsets.UTF_8))

        reader.use { br ->
            var line: String?
            var headerFound = false

            while (br.readLine().also { line = it } != null) {
                if (!headerFound) {
                    line = removeBom(line)
                    if (line!!.contains("nazwisko") && line!!.contains("email")) {
                        headerFound = true
                        continue
                    } else {
                        throw IllegalArgumentException("Nie znaleziono nagłówka w pliku CSV: '${file.fileName}'")
                    }
                }

                if (line.isNullOrBlank()) continue

                val fields = line!!.split(";").map { it.trim('"') }

                if (fields.size >= 6) {
                    val surname = fields[0]           // "nazwisko"
                    val firstName = fields[1]         // "imie"
                    val secondName = fields[2]        // "imie2"
                    val skreslony = fields[3]         // "skreslony"
                    val rezygnacja = fields[4]        // "rezygnacja"
                    val email = fields[5]             // "email"

                    // Check if the user is active
                    if (skreslony == "0" && rezygnacja == "0") {
                        val indexNumberRegex = Regex("(\\d+)@")
                        val indexNumberMatch = indexNumberRegex.find(email)
                        val indexNumber = indexNumberMatch?.groupValues?.get(1)?.toInt() ?: 0

                        val user = Users(
                            indexNumber = indexNumber,
                            nick = firstName + surname + indexNumber,
                            firstName = firstName,
                            secondName = surname,
                            role = UsersRoles.STUDENT,
                            email = email,
                            label = ""
                        )
                        users.add(user)
                    }
                }
            }
        }
        return users
    }
    private fun removeBom(line: String?): String? {
        if (line == null) return null
        return if (line.startsWith("\uFEFF")) {
            line.substring(1)
        } else {
            line
        }
    }
    private fun detectCharset(filePath: Path): Charset {
        val bom = ByteArray(2)
        Files.newInputStream(filePath).use { inputStream ->
            inputStream.read(bom)
        }
        return when {
            bom[0] == (-1).toByte() && bom[1] == (-2).toByte() -> Charsets.UTF_16LE
            bom[0] == (-2).toByte() && bom[1] == (-1).toByte() -> Charsets.UTF_16BE
            else -> Charsets.UTF_8 // Default to UTF-8 if no BOM is found
        }
    }
    fun extractGroupNumber(fileName: String): Int {
        val regex = Regex("_g(\\d+)_")
        val matchResult = regex.find(fileName)
        return matchResult?.groupValues?.get(1)?.toInt() ?: 0
    }
}
