package backend.userGroups

import backend.edition.Edition
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import backend.users.Users
import backend.groups.Groups
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

@Repository
interface UserGroupsRepository : JpaRepository<UserGroups, Long> {
    fun existsByUserAndGroup(user: Users, group: Groups): Boolean
    fun existsByUserAndGroup_Edition(user: Users, edition: Edition): Boolean
    fun findByGroup_GroupsId(groupId: Long): List<UserGroups>
    fun deleteByUserAndGroup(user: Users, group: Groups)
    fun findByUserAndGroup_Edition(user: Users, edition: Edition): List<UserGroups>
    @Modifying
    @Query("DELETE FROM UserGroups ug WHERE ug.user.userId = :userId AND ug.group.edition.editionId = :editionId")
    fun deleteByUserAndEdition(@Param("userId") userId: Long, @Param("editionId") editionId: Long)

}
