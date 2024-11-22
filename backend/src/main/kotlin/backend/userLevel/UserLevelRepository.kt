package backend.userLevel

import backend.edition.Edition
import backend.users.Users
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserLevelRepository : JpaRepository<UserLevel, Long> {
    fun deleteAllByUser_UserId(userId: Long)
    fun findByUserAndEdition(user: Users, edition: Edition): UserLevel?
}
