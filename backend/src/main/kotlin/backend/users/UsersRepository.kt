package backend.users

import backend.edition.Edition
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface UsersRepository : JpaRepository<Users, Long> {
    fun findByNick(nick:String) : Users?
    fun findByUserId(userId: Long) : Optional<Users>
    fun findByUserGroups_Group_GroupsId(groupId: Long) : List<Users>
    fun existsByIndexNumber(indexNumber: Int) : Boolean
    fun findByIndexNumber(indexNumber: Int) : Users?
    fun findByUserGroups_Group_Edition(edition: Edition) : List<Users>
    fun findByFirebaseUid(firebaseUid: String) : Users?
    fun existsByEmail(email: String) : Boolean
    fun existsByUserId(userId: Long) : Boolean
    fun existsByRole(role: UsersRoles) : Boolean
}
