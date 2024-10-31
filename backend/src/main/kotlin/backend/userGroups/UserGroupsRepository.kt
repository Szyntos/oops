package backend.userGroups

import backend.edition.Edition
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import backend.users.Users
import backend.groups.Groups

@Repository
interface UserGroupsRepository : JpaRepository<UserGroups, Long> {
    fun existsByUserAndGroup(user: Users, group: Groups): Boolean
    fun existsByUserAndGroup_Edition(user: Users, edition: Edition): Boolean
    fun findByGroup_GroupsId(groupId: Long): List<UserGroups>
    fun deleteByUserAndGroup(user: Users, group: Groups)
}
